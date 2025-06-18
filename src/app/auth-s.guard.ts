import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { GlobalService } from './service/global.service';

@Injectable({
  providedIn: 'root'
})
export class AuthSGuard implements CanActivate {
  constructor(private global: GlobalService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.global.admin === 'S') {
      return true;
    }
    alert('Accesso riservato agli amministratori principali.');
    this.router.navigate(['/']);
    return false;
  }
}
