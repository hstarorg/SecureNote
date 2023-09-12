import { verifyMessage } from 'viem';

export type RequestInfo<T extends any> = {
  pathname: string;
  query: Record<string, string>;
  params: any;
  data: T;
};

export const actionHandlers: Record<
  string,
  (info: RequestInfo<any>) => Promise<any>
> = {
  async signIn(info) {
    const { message, address, signature } = info.data;

    const verified = await verifyMessage({ message, signature, address });

    return { verified };
  },
};
