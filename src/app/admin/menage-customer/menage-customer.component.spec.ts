import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenageCustomerComponent } from './menage-customer.component';

describe('MenageCustomerComponent', () => {
  let component: MenageCustomerComponent;
  let fixture: ComponentFixture<MenageCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenageCustomerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenageCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
