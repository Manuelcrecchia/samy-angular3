import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvenzioniPromozioniComponent } from './convenzioni-promozioni.component';

describe('ConvenzioniPromozioniComponent', () => {
  let component: ConvenzioniPromozioniComponent;
  let fixture: ComponentFixture<ConvenzioniPromozioniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConvenzioniPromozioniComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConvenzioniPromozioniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
