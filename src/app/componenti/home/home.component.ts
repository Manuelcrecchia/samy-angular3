import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToCustomerArea() {
    this.router.navigateByUrl('/loginCustomer');
  }

  navigateToPrivateArea() {
    console.log("in");
    this.router.navigateByUrl('/loginPrivateArea');
  }
}

