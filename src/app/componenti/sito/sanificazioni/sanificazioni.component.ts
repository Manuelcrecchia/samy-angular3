import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sanificazioni',
  templateUrl: './sanificazioni.component.html',
  styleUrl: './sanificazioni.component.css'
})
export class SanificazioniComponent {
  constructor(private router: Router) {}



  navigateToHomeSito() {
    this.router.navigateByUrl('/homeSito');
  }
}
