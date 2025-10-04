import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthServiceService } from '../../auth-service.service';

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
    private http: HttpClient,
    private authService: AuthServiceService
  ) {}

  isMenuOpen: boolean = false;
  permessiInAttesa: number = 0;

  ngOnInit(): void {
    this.checkPermessiInAttesa();
  }

  checkPermessiInAttesa(): void {
    this.http
      .get<{ pending: number }>(this.global.url + 'permission/notify')
      .subscribe({
        next: (res) => {
          this.permessiInAttesa = res.pending;
          console.log('Permessi in attesa:', this.permessiInAttesa);
        },
        error: (err) => {
          console.error('Errore controllo permessi in attesa:', err);
        },
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
    if (this.global.admin == 'A' || this.global.admin == 'S') {
      this.router.navigateByUrl('/listCustomer');
    } else {
      this.popup.text = 'NON SEI AUTORIZZATO AD ACCEDERE A QUESTA FUNZIONE';
      this.popup.openPopup();
    }
  }

  goToShifts() {
    this.router.navigate(['/admin/shifts']);
  }

  goToHours() {
    this.router.navigate(['/riepilogo-presenze']);
  }

  back() {
    this.global.logout();
  }
  navigateToCambiapassword() {
    this.router.navigateByUrl('/cambiapassword');
  }
  navigateToGestioneemployees() {
    if (this.global.admin == 'A' || this.global.admin == 'S') {
      this.router.navigateByUrl('/gestioneemployees');
    } else {
      this.popup.text = 'NON SEI AUTORIZZATO AD ACCEDERE A QUESTA FUNZIONE';
      this.popup.openPopup();
    }
  }
  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    console.log('[AppComponent] Freccia indietro rilevata');
    this.authService.logout();
  }
}
