import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { GlobalService } from './service/global.service';

@Injectable({
  providedIn: 'root',
})
export class AuthLevelGuard implements CanActivate {
  constructor(private global: GlobalService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userLevel = this.global.admin;
    const requiredLevel = route.data['level'];

    if (!userLevel) {
      alert('Effettua il login per accedere.');
      // se non loggato → torna al login
      this.router.navigate(['/loginPrivateArea']);
      return false;
    }

    // Ordine gerarchico: B < A < S
    const hierarchy = ['B', 'A', 'S'];
    const userIndex = hierarchy.indexOf(userLevel);
    const requiredIndex = hierarchy.indexOf(requiredLevel);

    // ✅ Se l'utente ha livello sufficiente, entra
    if (userIndex >= requiredIndex) {
      return true;
    }

    // ❌ Se non ha i permessi, mostra avviso ma non cambia pagina
    alert('Accesso non autorizzato a questa sezione.');
    return false;
  }
}
