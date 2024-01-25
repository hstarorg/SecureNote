import { getAddress, verifyMessage } from 'viem';

import {
  CreateDocumentDto,
  DocumentContentDto,
  QueryDocumentDetailDto,
  SetIdentityDto,
  SignInDto,
  UpdateDocumentDto
} from '@/types/dto-types';

import { db, getSession } from './common';

import { BadRequestError, UnauthorizedError } from './errors';
import { SessionObject } from '@/types/common-types';

export type RequestInfo<T> = {
  pathname: string;
  query: Record<string, string>;
  params: any;
  data: T;
};

type HandlerFunc<T = any> = (info: RequestInfo<T>) => Promise<any>;

async function checkAndGetUser(): Promise<NonNullable<SessionObject['user']>> {
  const session = await getSession();
  if (!session.user || !session.user.address) {
    throw new UnauthorizedError();
  }
  return session.user!;
}

export const actionHandlers: Record<string, HandlerFunc> = {
  signIn: async (info: RequestInfo<SignInDto>) => {
    const { message, address, signature } = info.data;

    const verified = await verifyMessage({ message, signature, address });

    if (!verified) {
      throw new BadRequestError('Invalid signature');
    }

    const normalizedAddress = getAddress(address) as string;
    const user = await db.user.upsert({
      where: {
        address: normalizedAddress
      },
      update: {
        lastLoginAt: new Date()
      },
      create: {
        address: normalizedAddress,
        avatarUrl: '',
        identityPublicKey: '',
        identitySeed: '',
        displayName: ''
      }
    });
    const session = await getSession();
    session.user = { address: user.address };
    await session.save();
    return null;
  },

  signOut: async () => {
    const session = await getSession();
    session.destroy();
    return null;
  },

  async setIdentity(info: RequestInfo<SetIdentityDto>) {
    const { identitySeed, identityPublicKey } = info.data;
    const sessionUser = await checkAndGetUser();
    try {
      const user = await db.user.update({
        where: { address: sessionUser.address, identitySeed: '', identityPublicKey: '' },
        data: {
          identitySeed,
          identityPublicKey
        }
      });
      if (!user.identitySeed) {
        throw new BadRequestError('Set identity failed');
      }
      return null;
    } catch (e) {
      console.error(e);
      throw new BadRequestError('Set identity failed');
    }
  },

  async getUser() {
    const sessionUser = await checkAndGetUser();

    const user = await db.user.findUnique({
      where: { address: sessionUser.address }
    });
    return user;
  },

  async queryMyDocuments() {
    const sessionUser = await checkAndGetUser();

    const docs = await db.doc.findMany({
      where: { author: sessionUser.address },
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        id: true
      }
    });
    return { rows: docs };
  },

  async createDocument(info: RequestInfo<CreateDocumentDto>) {
    const sessionUser = await checkAndGetUser();

    const { title, description, pwd2 } = info.data;
    const newDoc = await db.doc.create({
      data: {
        title,
        description: description || '',
        pwd2,
        author: sessionUser.address,
        content: '',
        deleted: false
      }
    });

    return { doc: newDoc };
  },

  async getDocumentDetail(info: RequestInfo<QueryDocumentDetailDto>) {
    const sessionUser = await checkAndGetUser();

    const { docId } = info.data;

    const doc = await db.doc.findUnique({
      where: {
        id: docId,
        author: sessionUser.address
      },
      select: {
        content: true,
        createdAt: true,
        description: true,
        id: true,
        pwd2: true,
        title: true,
        updatedAt: true
      }
    });
    return doc;
  },

  async updateDocument(info: RequestInfo<UpdateDocumentDto>) {
    const { title, description } = info.data;
    return { doc: { title, description } };
  },

  async saveDocumentContent(info: RequestInfo<DocumentContentDto>) {
    const sessionUser = await checkAndGetUser();

    const { docId, content } = info.data;

    await db.doc.update({
      where: { id: docId, author: sessionUser.address },
      data: { content, updatedAt: new Date() }
    });

    return null;
  }
};
