import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesSettingsComponent } from './employees-settings.component';

describe('EmployeesSettingsComponent', () => {
  let component: EmployeesSettingsComponent;
  let fixture: ComponentFixture<EmployeesSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeesSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmployeesSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
