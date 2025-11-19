import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiepilogoPresenzeEditabileComponent } from './riepilogo-presenze-editabile.component';

describe('RiepilogoPresenzeEditabileComponent', () => {
  let component: RiepilogoPresenzeEditabileComponent;
  let fixture: ComponentFixture<RiepilogoPresenzeEditabileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiepilogoPresenzeEditabileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiepilogoPresenzeEditabileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
