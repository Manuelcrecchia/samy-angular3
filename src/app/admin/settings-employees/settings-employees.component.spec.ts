import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsEmployeesComponent } from './settings-employees.component';

describe('SettingsEmployeesComponent', () => {
  let component: SettingsEmployeesComponent;
  let fixture: ComponentFixture<SettingsEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsEmployeesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingsEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
