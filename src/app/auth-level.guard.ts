import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { GlobalService } from './service/global.service';

@Injectable({
  providedIn: 'root',
})
export class AuthLevelGuard implements CanActivate {
  constructor(private global: GlobalService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const required = route.data['permission'] as string | undefined;
    const requiredAny = route.data['permissionsAny'] as string[] | undefined;

    // non loggato
    if (!this.global.token) {
      alert('Effettua il login per accedere.');
      this.router.navigate(['/loginPrivateArea']);
      return false;
    }

    // nessun vincolo: solo autenticazione
    if (!required && !requiredAny) return true;

    const userPerms = this.global.permissions || [];

    const ok =
      (required ? userPerms.includes(required) : false) ||
      (Array.isArray(requiredAny) ? requiredAny.some((p) => userPerms.includes(p)) : false);

    if (ok) return true;

    alert('Accesso non autorizzato a questa sezione.');
    return false;
  }
}
