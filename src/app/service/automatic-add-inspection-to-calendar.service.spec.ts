import { TestBed } from '@angular/core/testing';

import { AutomaticAddInspectionToCalendarService } from './automatic-add-inspection-to-calendar.service';

describe('AutomaticAddInspectionToCalendarService', () => {
  let service: AutomaticAddInspectionToCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomaticAddInspectionToCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
