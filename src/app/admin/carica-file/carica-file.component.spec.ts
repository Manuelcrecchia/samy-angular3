import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaricaFileComponent } from './carica-file.component';

describe('CaricaFileComponent', () => {
  let component: CaricaFileComponent;
  let fixture: ComponentFixture<CaricaFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaricaFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaricaFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
