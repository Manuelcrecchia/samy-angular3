import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-homeadmin',
  templateUrl: './homeadmin.component.html',
  styleUrls: ['./homeadmin.component.css']
})
export class HomeAdminComponent implements OnInit {

  constructor(private el: ElementRef) { }

  isMenuOpen: boolean = false;

  ngOnInit() {
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }



}
