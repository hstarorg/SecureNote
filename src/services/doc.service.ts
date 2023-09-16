import { CreateDocumentDto, UpdateDocumentDto } from '@/types/dto-types';
import { gatewayRequest } from './gateway.base';

export function createDocument(dto: CreateDocumentDto) {
  return gatewayRequest('createDocument', dto);
}

export function updateDocument(dto: UpdateDocumentDto) {
  return gatewayRequest('updateDocument', dto);
}

export function updateDocumentContent(dto: UpdateDocumentDto) {
  return gatewayRequest('updateDocument', dto);
}