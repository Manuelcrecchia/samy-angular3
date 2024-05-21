import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomesitoComponent } from './homesito.component';

describe('HomesitoComponent', () => {
  let component: HomesitoComponent;
  let fixture: ComponentFixture<HomesitoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomesitoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomesitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
