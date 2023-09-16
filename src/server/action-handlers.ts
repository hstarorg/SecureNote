import { getAddress, verifyMessage } from 'viem';
import { db } from '../common';
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

    console.log('godddddddd', db.user, db.docs)
    const user = await db.user.create({
      data: {
        adderss: getAddress(address) as string,
        avatarUrl: '',
        identityPublicKey: '',
        identitySeed: '',
        displayName: '',
      },
    });
    return null;
  },

  async createDocument(info: RequestInfo<CreateDocumentDto>) {
    const { title, description, pwd2 } = info.data;
    const newDoc = await db.docs.create({
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
