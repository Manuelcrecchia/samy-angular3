
import { Component,  } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homesito',
  templateUrl: './homesito.component.html',
  styleUrl: './homesito.component.css'
})
export class HomesitoComponent {
  constructor(private router: Router) {}


  navigateToHome() {
    this.router.navigateByUrl('/home');
  }

}
