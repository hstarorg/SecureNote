import { SetIdentityDto, SignInDto, UserRespDto } from '@/types/dto-types';

import { gatewayRequest } from './gateway.base';

export function signIn(signInDto: SignInDto) {
  return gatewayRequest('signIn', signInDto);
}

export function signOut() {
  return gatewayRequest('signOut');
}

export function getUser(): Promise<UserRespDto> {
  return gatewayRequest('getUser');
}

export function setIdentity(dto: SetIdentityDto) {
  return gatewayRequest('setIdentity', dto);
}
