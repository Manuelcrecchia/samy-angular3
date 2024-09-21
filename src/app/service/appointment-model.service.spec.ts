import { TestBed } from '@angular/core/testing';

import { AppointmentModelService } from './appointment-model.service';

describe('AppointmentModelService', () => {
  let service: AppointmentModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
