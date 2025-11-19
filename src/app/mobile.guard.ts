import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { GlobalService } from './service/global.service';

@Injectable({
  providedIn: 'root',
})
export class MobileGuard implements CanActivate {
  constructor(private global: GlobalService, private router: Router) {}

  canActivate(): boolean {
    // Se la modalità mobile è attiva → blocca pagine pubbliche
    if (this.global.forMobile) {
      this.router.navigate(['/loginPrivateArea']);
      return false;
    }

    return true;
  }
}
