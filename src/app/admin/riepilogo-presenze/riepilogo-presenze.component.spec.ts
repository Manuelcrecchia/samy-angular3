import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiepilogoPresenzeComponent } from './riepilogo-presenze.component';

describe('RiepilogoPresenzeComponent', () => {
  let component: RiepilogoPresenzeComponent;
  let fixture: ComponentFixture<RiepilogoPresenzeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiepilogoPresenzeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiepilogoPresenzeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
