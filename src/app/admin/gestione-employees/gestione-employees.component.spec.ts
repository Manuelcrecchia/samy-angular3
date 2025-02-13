import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneEmployeesComponent } from './gestione-employees.component';

describe('GestioneEmployeesComponent', () => {
  let component: GestioneEmployeesComponent;
  let fixture: ComponentFixture<GestioneEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneEmployeesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestioneEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
