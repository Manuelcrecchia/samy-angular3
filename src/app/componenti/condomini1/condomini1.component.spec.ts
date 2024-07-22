import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Condomini1Component } from './condomini1.component';

describe('Condomini1Component', () => {
  let component: Condomini1Component;
  let fixture: ComponentFixture<Condomini1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Condomini1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Condomini1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
