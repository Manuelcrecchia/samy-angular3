import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomesticaComponent } from './domestica.component';

describe('DomesticaComponent', () => {
  let component: DomesticaComponent;
  let fixture: ComponentFixture<DomesticaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DomesticaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DomesticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
