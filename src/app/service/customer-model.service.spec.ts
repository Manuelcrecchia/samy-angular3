import { TestBed } from '@angular/core/testing';

import { CustomerModelService } from './customer-model.service';

describe('CustomerModelService', () => {
  let service: CustomerModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
