import {
  CreateDocumentDto,
  DocumentContentDto,
  DocumentRespDto,
  QueryDocumentDetailDto,
  QueryDocumentDto,
  UpdateDocumentDto
} from '@/types/dto-types';

import { gatewayRequest } from './gateway.base';

export function queryMyDocuments(dto: QueryDocumentDto) {
  return gatewayRequest('queryMyDocuments', dto);
}

export function createDocument(dto: CreateDocumentDto) {
  return gatewayRequest('createDocument', dto);
}

export function updateDocument(dto: UpdateDocumentDto) {
  return gatewayRequest('updateDocument', dto);
}

export function saveDocumentContent(dto: DocumentContentDto) {
  return gatewayRequest('saveDocumentContent', dto);
}

export function getDocumentDetail(dto: QueryDocumentDetailDto): Promise<DocumentRespDto> {
  return gatewayRequest('getDocumentDetail', dto);
}
