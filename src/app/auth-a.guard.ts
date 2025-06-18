import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { GlobalService } from './service/global.service';

@Injectable({
  providedIn: 'root'
})
export class AuthAGuard implements CanActivate {
  constructor(private global: GlobalService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.global.admin === 'A' || this.global.admin === 'S') {
      return true;
    }
    alert('Accesso riservato ad amministratori o autorizzati.');
    this.router.navigate(['/']);
    return false;
  }
}
