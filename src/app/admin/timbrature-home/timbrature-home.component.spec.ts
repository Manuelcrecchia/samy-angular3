import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbratureHomeComponent } from './timbrature-home.component';

describe('TimbratureHomeComponent', () => {
  let component: TimbratureHomeComponent;
  let fixture: ComponentFixture<TimbratureHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimbratureHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimbratureHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
