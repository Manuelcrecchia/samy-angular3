import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbratureDettaglioComponent } from './timbrature-dettaglio.component';

describe('TimbratureDettaglioComponent', () => {
  let component: TimbratureDettaglioComponent;
  let fixture: ComponentFixture<TimbratureDettaglioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimbratureDettaglioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimbratureDettaglioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
