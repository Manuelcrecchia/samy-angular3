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
    console.log('[AuthGuard] Token trovato:', token);
    if (!token) {
      console.log('[AuthGuard] Token mancante, reindirizzamento al login');
      this.router.navigate(['/']);
      return false;
    }
    try {
      const decoded = jwtDecode(token);
      console.log('[AuthGuard] Token decodificato:', decoded);
      
      if (!decoded || !decoded.exp) {
        console.log('[AuthGuard] Token non valido (exp mancante), reindirizzo al login');
        this.router.navigate(['/']);
        return false;
      }
      
      const exp = decoded.exp * 1000;
      if (Date.now() > exp) {
        console.log('[AuthGuard] Token scaduto, reindirizzamento al login');
        this.router.navigate(['/']);
        return false;
      }
      console.log('[AuthGuard] Token valido, accesso consentito');
      return true;
    } catch (error) {
      console.log('[AuthGuard] Errore nella decodifica del token, reindirizzamento al login:', error);
      this.router.navigate(['/']);
      return false;
    }
  }
}
