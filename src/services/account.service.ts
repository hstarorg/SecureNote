import { SignInDto } from '@/types/dto-types';
import { gatewayRequest } from './gateway.base';

export function signIn(signInDto: SignInDto) {
  return gatewayRequest('signIn', signInDto);
}

export function signOut() {
  return gatewayRequest('signOut');
}

export function getUser(): Promise<{ address: string }> {
  return gatewayRequest('getUser');
}
