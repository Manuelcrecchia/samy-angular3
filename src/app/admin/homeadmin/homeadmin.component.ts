import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-homeadmin',
  templateUrl: './homeadmin.component.html',
  styleUrls: ['./homeadmin.component.css']
})
export class HomeAdminComponent implements OnInit {

  constructor(private el: ElementRef, private router: Router) { }

  isMenuOpen: boolean = false;

  ngOnInit() {
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToUserSettings() {
    this.router.navigateByUrl('/userSettings');

  }

  navigateToEmployeesSettings() {
    this.router.navigateByUrl('/employeesSettings')
  }



}
