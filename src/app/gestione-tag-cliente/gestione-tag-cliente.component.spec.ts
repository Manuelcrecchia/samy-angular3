import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneTagClienteComponent } from './gestione-tag-cliente.component';

describe('GestioneTagClienteComponent', () => {
  let component: GestioneTagClienteComponent;
  let fixture: ComponentFixture<GestioneTagClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneTagClienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestioneTagClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
