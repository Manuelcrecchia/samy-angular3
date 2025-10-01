import { TestBed } from '@angular/core/testing';

import { SoketService } from './soket.service';

describe('SoketService', () => {
  let service: SoketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
