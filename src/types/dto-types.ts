export type HexString = `0x${string}`;

export type SignInDto = {
  address: HexString;
  signature: HexString;
  message: string;
};

export type UserRespDto = {
  address: string;
  createdAt: Date;
  lastLoginAt: Date;
  avatarUrl: string;
  displayName: string;
  identitySeed: string;
  identityPublicKey: string;
};

export type SetIdentityDto = {
  identitySeed: string;
  identityPublicKey: string;
};

export type QueryDocumentDto = {};

export type CreateDocumentDto = {
  title: string;
  description: string;
  content: string;
  pwd2: string;
};

export type UpdateDocumentDto = {
  title: string;
  description: string;
};

export type DocumentContentDto = {};
