import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftHomeComponent } from './shift-home.component';

describe('ShiftHomeComponent', () => {
  let component: ShiftHomeComponent;
  let fixture: ComponentFixture<ShiftHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShiftHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
