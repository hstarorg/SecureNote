import { gatewayRequest } from './gateway.base';

export function signIn(signInDto: {
  address: string;
  signature: string;
  message: string;
}) {
  return gatewayRequest('signIn', signInDto);
}
