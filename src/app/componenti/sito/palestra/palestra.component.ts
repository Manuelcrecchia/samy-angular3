import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-palestra',
  templateUrl: './palestra.component.html',
  styleUrl: './palestra.component.css'
})
export class PalestraComponent {

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
