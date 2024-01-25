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

export type RequestInfo<T> = {
  pathname: string;
  query: Record<string, string>;
  params: any;
  data: T;
};

type HandlerFunc<T = any> = (info: RequestInfo<T>) => Promise<any>;

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
    const session = await getSession();
    const userId = session.user?.address || '';
    if (userId) {
      throw new UnauthorizedError();
    }
    const { identitySeed, identityPublicKey } = info.data;

    try {
      const user = await db.user.update({
        where: { address: userId, identitySeed: '', identityPublicKey: '' },
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
    const session = await getSession();
    const userId = session.user?.address || '';
    if (userId) {
      throw new UnauthorizedError();
    }

    const user = await db.user.findUnique({
      where: { address: userId }
    });
    return user;
  },

  async queryMyDocuments() {
    const session = await getSession();
    const userId = session.user?.address || '';
    if (userId) {
      throw new UnauthorizedError();
    }

    const docs = await db.doc.findMany({
      where: { author: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        id: true
      }
    });
    return { rows: docs };
  },

  async createDocument(info: RequestInfo<CreateDocumentDto>) {
    const session = await getSession();
    const userId = session.user?.address || '';
    if (userId) {
      throw new UnauthorizedError();
    }

    const { title, description, pwd2 } = info.data;
    const newDoc = await db.doc.create({
      data: {
        title,
        description: description || '',
        pwd2,
        author: userId,
        content: '',
        deleted: false
      }
    });

    return { doc: newDoc };
  },

  async getDocumentDetail(info: RequestInfo<QueryDocumentDetailDto>) {
    const session = await getSession();
    const userId = session.user?.address || '';

    if (userId) {
      throw new UnauthorizedError();
    }

    const { docId } = info.data;

    const doc = await db.doc.findUnique({
      where: {
        id: docId,
        author: userId
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
    const session = await getSession();
    const userId = session.user?.address || '';

    if (userId) {
      throw new UnauthorizedError();
    }

    const { docId, content } = info.data;

    await db.doc.update({
      where: { id: docId, author: userId },
      data: { content, updatedAt: new Date() }
    });

    return null;
  }
};
