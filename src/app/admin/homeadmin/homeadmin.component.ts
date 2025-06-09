import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-homeadmin',
  templateUrl: './homeadmin.component.html',
  styleUrls: ['./homeadmin.component.css'],
})
export class HomeAdminComponent implements OnInit {
  constructor(
    private el: ElementRef,
    private router: Router,
    private global: GlobalService,
    private popup: PopupServiceService,
    public quoteModelService: QuoteModelService,
    private location: Location
  ) {}

  isMenuOpen: boolean = false;

  ngOnInit() {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToCaricaFile() {
    this.router.navigateByUrl('/document-manager');
  }

  navigateToCalendarHome() {
    this.router.navigateByUrl('/calendarHome');
  }

  navigateToUserSettings() {
    if (this.global.admin == 'S') {
      this.router.navigateByUrl('/userSettings');
    } else {
      this.popup.text = 'NON SEI AUTORIZZATO AD ACCEDERE A QUESTA FUNZIONE';
      this.popup.openPopup();
    }
  }

  navigateToSettingsEmployees() {
    this.router.navigateByUrl('/settingsemployees');
  }

  navigateToQuotesHome() {
    this.router.navigateByUrl('/quotesHome');
  }

  navigateToListCustomer() {
    this.router.navigateByUrl('/listCustomer');
  }

  goToShifts() {
    this.router.navigate(['/admin/shifts']);
  }

  back() {
    this.router.navigateByUrl('/');
  }
  navigateToCambiapassword() {
    this.router.navigateByUrl('/cambiapassword');
  }
  navigateToGestioneemployees() {
    this.router.navigateByUrl('/gestioneemployees');
  }

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event): void {
    event.preventDefault();
    this.quoteModelService.resetQuoteModel();
    this.location.replaceState('/');
    this.router.navigateByUrl('/');
  }
}
