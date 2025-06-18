import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authSGuard } from './auth-s.guard';

describe('authSGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authSGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
