import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneAssenzeComponent } from './gestione-assenze.component';

describe('GestioneAssenzeComponent', () => {
  let component: GestioneAssenzeComponent;
  let fixture: ComponentFixture<GestioneAssenzeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneAssenzeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestioneAssenzeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
