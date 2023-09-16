import { getAddress, verifyMessage, verifyTypedData } from 'viem';
import { db, getSession, setSession } from '../common';
import {
  CreateDocumentDto,
  DocumentContentDto,
  QueryDocumentDto,
  SetIdentityDto,
  SignInDto,
  UpdateDocumentDto,
} from '@/types/dto-types';
import { BadRequestError } from './errors';

export type RequestInfo<T extends any> = {
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
        address: normalizedAddress,
      },
      update: {
        lastLoginAt: new Date(),
      },
      create: {
        address: normalizedAddress,
        avatarUrl: '',
        identityPublicKey: '',
        identitySeed: '',
        displayName: '',
      },
    });
    await setSession({ user: { address: user.address } });
    return null;
  },

  signOut: async () => {
    await setSession({ user: undefined });
    return null;
  },

  async setIdentity(info: RequestInfo<SetIdentityDto>) {
    const session = await getSession();
    const userId = session.user?.address || '';
    const { identitySeed, identityPublicKey } = info.data;

    try {
      const user = await db.user.update({
        where: { address: userId, identitySeed: '', identityPublicKey: '' },
        data: {
          identitySeed,
          identityPublicKey,
        },
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
    const user = await db.user.findUnique({
      where: { address: userId },
    });
    return user;
  },

  async queryMyDocuments(info: RequestInfo<QueryDocumentDto>) {
    const session = await getSession();
    const userId = session.user?.address || '';
    const docs = await db.doc.findMany({
      where: { author: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
      },
    });
    return { rows: docs };
  },

  async createDocument(info: RequestInfo<CreateDocumentDto>) {
    const { title, description, pwd2 } = info.data;
    const newDoc = await db.doc.create({
      data: {
        title,
        description: description || '',
        pwd2,
        author: '',
        content: '',
        deleted: false,
      },
    });

    return { doc: newDoc };
  },

  async updateDocument(info: RequestInfo<UpdateDocumentDto>) {
    const { title, description } = info.data;
    return { doc: {} };
  },

  async saveDocumentContent(info: RequestInfo<DocumentContentDto>) {},
};
