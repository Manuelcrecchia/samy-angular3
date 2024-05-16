import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-homeadmin',
  templateUrl: './homeadmin.component.html',
  styleUrls: ['./homeadmin.component.css']
})
export class HomeAdminComponent implements OnInit {

  constructor(private el: ElementRef) { }

  ngOnInit() {
  }

  toggleMenu() {
    const menu = this.el.nativeElement.querySelector('.menu');
    menu.classList.toggle('open');
  }

}
