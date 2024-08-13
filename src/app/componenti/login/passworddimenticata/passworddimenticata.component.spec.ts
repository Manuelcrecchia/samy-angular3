import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassworddimenticataComponent } from './passworddimenticata.component';

describe('PassworddimenticataComponent', () => {
  let component: PassworddimenticataComponent;
  let fixture: ComponentFixture<PassworddimenticataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PassworddimenticataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PassworddimenticataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
