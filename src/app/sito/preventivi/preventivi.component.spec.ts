import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreventiviComponent } from './preventivi.component';

describe('PreventiviComponent', () => {
  let component: PreventiviComponent;
  let fixture: ComponentFixture<PreventiviComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreventiviComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreventiviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
