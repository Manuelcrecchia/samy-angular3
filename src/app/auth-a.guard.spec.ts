import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authAGuard } from './auth-a.guard';

describe('authAGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authAGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
