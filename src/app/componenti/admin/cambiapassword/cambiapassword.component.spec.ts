import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiapasswordComponent } from './cambiapassword.component';

describe('CambiapasswordComponent', () => {
  let component: CambiapasswordComponent;
  let fixture: ComponentFixture<CambiapasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CambiapasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CambiapasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
