import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-newhome',
  templateUrl: './newhome.component.html',
  styleUrl: './newhome.component.css'
})
export class NewhomeComponent {

  constructor(private router: Router) {} // Add the router property

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

}
