
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-condomini1',
  templateUrl: './condomini1.component.html',
  styleUrl: './condomini1.component.css'
})


export class Condomini1Component {
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
