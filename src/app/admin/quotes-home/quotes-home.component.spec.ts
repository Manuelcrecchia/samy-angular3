import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotesHomeComponent } from './quotes-home.component';

describe('QuotesHomeComponent', () => {
  let component: QuotesHomeComponent;
  let fixture: ComponentFixture<QuotesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuotesHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuotesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
