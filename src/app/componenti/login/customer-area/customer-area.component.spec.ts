import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAreaComponent } from './customer-area.component';

describe('CustomerAreaComponent', () => {
  let component: CustomerAreaComponent;
  let fixture: ComponentFixture<CustomerAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
