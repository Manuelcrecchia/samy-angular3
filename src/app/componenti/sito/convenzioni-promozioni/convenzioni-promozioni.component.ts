import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-convenzioni-promozioni',
  templateUrl: './convenzioni-promozioni.component.html',
  styleUrl: './convenzioni-promozioni.component.css'
})
export class ConvenzioniPromozioniComponent {
  services: any;
  constructor(private router: Router) {}
  navigateToPreventivi() {
    this.router.navigateByUrl('/preventivi');
  }
}
