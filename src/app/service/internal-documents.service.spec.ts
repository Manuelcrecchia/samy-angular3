import { TestBed } from '@angular/core/testing';

import { InternalDocumentsService } from './internal-documents.service';

describe('InternalDocumentsService', () => {
  let service: InternalDocumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternalDocumentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
