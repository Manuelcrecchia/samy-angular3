
import { Component,  } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homesito',
  templateUrl: './homesito.component.html',
  styleUrls: ['./homesito.component.css']
})
export class HomesitoComponent {
  constructor(private router: Router) {}

  navigateToCustomerArea() {
    this.router.navigateByUrl('/loginCustomer');
  }

  navigateToPrivateArea() {
    this.router.navigateByUrl('/loginPrivateArea');
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
  navigateToPrivacy() {
    this.router.navigateByUrl('/privacy');
  }
  navigateToNavbar() {
    this.router.navigateByUrl('/navbar');
  }
  navigateToPreventivi() {
    this.router.navigateByUrl('/preventivi');
  }
}

