import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router: Router) {} // Declare the 'router' property
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
  navigateToPalestra() {
    this.router.navigateByUrl('/palestra');
  }
  navigateToStraordinaria() {
    this.router.navigateByUrl('/straordinaria');
  }
  navigateToDomestica() {
    this.router.navigateByUrl('/domestica');
}

}
