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
    private authService: AuthServiceService,
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
    this.router.navigateByUrl('/userSettings');
  }

  navigateToSettingsEmployees() {
    this.router.navigateByUrl('/settingsemployees');
  }

  navigateToQuotesHome() {
    this.router.navigateByUrl('/quotesHome');
  }

  navigateToGestionePermessi() {
    this.router.navigateByUrl('/gestionepermessi');
  }

  navigateToListCustomer() {
    this.router.navigateByUrl('/listCustomer');
  }

  goToShifts() {
    this.router.navigate(['/admin/shifts']);
  }
  navigateToTimbrature() {
    this.router.navigateByUrl('/timbratureHome');
  }

  goToEditableHours() {
    this.router.navigate(['/riepilogo-presenze-editabile']);
  }

  back() {
    this.global.logout();
  }
  navigateToCambiapassword() {
    this.router.navigateByUrl('/cambiapassword');
  }
  navigateToGestioneemployees() {
    this.router.navigateByUrl('/gestioneemployees');
  }
  navigateToLeaveSettings() {
    this.router.navigateByUrl('/leave-settings');
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    console.log('[AppComponent] Freccia indietro rilevata');
    this.authService.logout();
  }
}
