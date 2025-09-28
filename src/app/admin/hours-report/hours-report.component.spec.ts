import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursReportComponent } from './hours-report.component';

describe('HoursReportComponent', () => {
  let component: HoursReportComponent;
  let fixture: ComponentFixture<HoursReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HoursReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HoursReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
