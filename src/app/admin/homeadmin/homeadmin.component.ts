import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';


@Component({
  selector: 'app-homeadmin',
  templateUrl: './homeadmin.component.html',
  styleUrls: ['./homeadmin.component.css']
})
export class HomeAdminComponent implements OnInit {

  constructor(private el: ElementRef, private router: Router, private global: GlobalService, private popup: PopupServiceService) { }

  isMenuOpen: boolean = false;

  ngOnInit() {
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToCaricaFile() {
    this.router.navigateByUrl('/caricaFile')
  }


  navigateToUserSettings() {
    if(this.global.admin == "S")
    {this.router.navigateByUrl('/userSettings');}
      else {
        this.popup.text = "NON SEI AUTORIZZATO AD ACCEDERE A QUESTA FUNZIONE";
        this.popup.openPopup();
      }
    }

  navigateToEmployeesSettings() {
    this.router.navigateByUrl('/employeesSettings')
  }

  navigateToQuotesHome() {
    this.router.navigateByUrl('/quotesHome')
  }

  navigateToListCustomer() {
    this.router.navigateByUrl('/listCustomer')
  }



  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event:Event){
    event.preventDefault();
    console.log('Back button pressedm');
    this.router.navigateByUrl('/')
  }


}
