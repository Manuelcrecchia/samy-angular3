import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalestraComponent } from './palestra.component';

describe('PalestraComponent', () => {
  let component: PalestraComponent;
  let fixture: ComponentFixture<PalestraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PalestraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PalestraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
