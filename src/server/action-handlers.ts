import { getAddress, verifyMessage } from 'viem';
import { db, getSession, setSession } from '../common';
import {
  CreateDocumentDto,
  DocumentContentDto,
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

  async getUser() {
    const session = await getSession();
    const userId = session.user?.address || '';
    const user = await db.user.findUnique({
      where: { address: userId },
    });
    return user;
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
