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

  navigateToCalendarHome() {
    this.router.navigateByUrl('/calendarHome')
  }

  navigateToUserSettings() {
    if(this.global.admin == "S")
    {this.router.navigateByUrl('/userSettings');}
      else {
        this.popup.text = "NON SEI AUTORIZZATO AD ACCEDERE A QUESTA FUNZIONE";
        this.popup.openPopup();
      }
    }

  navigateToSettingsEmployees() {
    this.router.navigateByUrl('/settingsemployees')
  }

  navigateToQuotesHome() {
    this.router.navigateByUrl('/quotesHome')
  }

  navigateToListCustomer() {
    this.router.navigateByUrl('/listCustomer')
  }

back(){
  this.router.navigateByUrl('/')
}
navigateToCambiapassword() {
  this.router.navigateByUrl('/cambiapassword')
}
navigateToGestioneemployees() {
  this.router.navigateByUrl('/gestioneemployees')
}


  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event:Event){
    event.preventDefault();
    this.router.navigateByUrl('/')
  }


}
