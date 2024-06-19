import { TestBed } from '@angular/core/testing';

import { QuoteModelService } from './quote-model.service';

describe('QuoteModelService', () => {
  let service: QuoteModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuoteModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
