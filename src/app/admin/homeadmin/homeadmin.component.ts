import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';


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
    private location: Location,
    private http: HttpClient // 👈 AGGIUNTO
  ) {}

  isMenuOpen: boolean = false;
  permessiInAttesa: number = 0;

  ngOnInit(): void {
    this.checkPermessiInAttesa();
  }

  checkPermessiInAttesa(): void {
    this.http.get<{ pending: number }>(this.global.url + 'permission/notify').subscribe({
      next: (res) => {
        this.permessiInAttesa = res.pending;
      },
      error: (err) => {
        console.error('Errore controllo permessi in attesa:', err);
      }
    });
  }
  

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
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
    if (this.global.admin == 'S') {
      this.router.navigateByUrl('/settingsemployees');
    } else {
      this.popup.text = 'NON SEI AUTORIZZATO AD ACCEDERE A QUESTA FUNZIONE';
      this.popup.openPopup();
    }
  }

  navigateToQuotesHome() {
    this.router.navigateByUrl('/quotesHome');
  }
  
  navigateToGestionePermessi() {
    this.router.navigateByUrl('/gestionepermessi');
  }

  navigateToListCustomer() {
    if (this.global.admin == 'A' || this.global.admin == "S") {
      this.router.navigateByUrl('/listCustomer');
    } else {
      this.popup.text = 'NON SEI AUTORIZZATO AD ACCEDERE A QUESTA FUNZIONE';
      this.popup.openPopup();
    }
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
    if (this.global.admin == 'A' || this.global.admin == "S") {
      this.router.navigateByUrl('/gestioneemployees');
    } else {
      this.popup.text = 'NON SEI AUTORIZZATO AD ACCEDERE A QUESTA FUNZIONE';
      this.popup.openPopup();
    }
  }

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event): void {
    event.preventDefault();
    this.quoteModelService.resetQuoteModel();
    this.location.replaceState('/');
    this.router.navigateByUrl('/');
  }

}
