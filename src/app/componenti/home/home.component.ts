import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) {}

  buttonClicked(buttonName: string) {
    if (buttonName === 'Area Clienti') {
      this.router.navigate(['/path/to/clienti']);
    } else if (buttonName === 'Area Riservati') {
      this.router.navigate(['/login']);
    }
  }
}

