import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-domestica',
  templateUrl: './domestica.component.html',
  styleUrl: './domestica.component.css'
})
export class DomesticaComponent {
  constructor(private router: Router) {}


  navigateToHomeSito() {
    this.router.navigateByUrl('/homeSito');
  }
  navigateToSanificazioni() {
    this.router.navigateByUrl('/sanificazioni');
  }
  navigateToUffici() {
    this.router.navigateByUrl('/uffici');
  }
  navigateToCondomini1() {
    this.router.navigateByUrl('/condomini1');
  }
}
