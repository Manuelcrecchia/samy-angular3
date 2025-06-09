import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedaClienteComponent } from './scheda-cliente.component';

describe('SchedaClienteComponent', () => {
  let component: SchedaClienteComponent;
  let fixture: ComponentFixture<SchedaClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchedaClienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchedaClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
