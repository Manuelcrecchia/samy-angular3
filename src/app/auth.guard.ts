import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { GlobalService } from './service/global.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private globalService: GlobalService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.globalService.token;
    if (!token) {
      this.router.navigate(['/']);
      return false;
    }
  
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp || Date.now() > decoded.exp * 1000) {
        this.router.navigate(['/']);
        return false;
      }
  
      return true;
    } catch (e) {
      this.router.navigate(['/']);
      return false;
    }
  }
  
}
