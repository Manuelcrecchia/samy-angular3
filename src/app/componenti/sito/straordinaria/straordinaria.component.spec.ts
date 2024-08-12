import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StraordinariaComponent } from './straordinaria.component';

describe('StraordinariaComponent', () => {
  let component: StraordinariaComponent;
  let fixture: ComponentFixture<StraordinariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StraordinariaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StraordinariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
