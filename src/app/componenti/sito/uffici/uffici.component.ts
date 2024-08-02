import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-uffici',
  templateUrl: './uffici.component.html',
  styleUrl: './uffici.component.css'
})
export class UfficiComponent {
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
