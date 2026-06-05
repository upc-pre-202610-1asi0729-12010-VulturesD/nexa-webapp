import { BusinessDocument } from '@/invoicing/domain/model/business-document.entity';

export class BusinessDocumentAssembler {
  static toEntity(resource = {}) {
    return new BusinessDocument(resource);
  }

  static toEntities(resources = []) {
    return resources.map(resource => this.toEntity(resource));
  }
}
