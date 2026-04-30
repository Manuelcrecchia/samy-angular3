import { Component, OnDestroy, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthServiceService } from '../../auth-service.service';
import { TenantService } from '../../service/tenant.service';
import { SocketService } from '../../service/soket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

type DeadlineStatus = 'ok' | 'warning' | 'expired';

interface DeadlineSummary {
  expiredCount: number;
  warningCount: number;
  alertCount: number;
  totalCount: number;
  status: DeadlineStatus;
}

@Component({
  selector: 'app-homeadmin',
  templateUrl: './homeadmin.component.html',
  styleUrls: ['./homeadmin.component.css'],
})
export class HomeAdminComponent implements OnInit, OnDestroy {
  private quoteAcceptanceSubscription?: Subscription;

  constructor(
    private el: ElementRef,
    private router: Router,
    public global: GlobalService,
    private popup: PopupServiceService,
    public quoteModelService: QuoteModelService,
    private location: Location,
    private http: HttpClient,
    private authService: AuthServiceService,
    public tenantService: TenantService,
    private socketService: SocketService,
    private snackBar: MatSnackBar,
  ) {}

  isMenuOpen: boolean = false;
  permessiInAttesa: number = 0;
  pendingQuoteReviews: number = 0;
  employeeDeadlineSummary: DeadlineSummary = this.emptyDeadlineSummary();
  vehicleDeadlineSummary: DeadlineSummary = this.emptyDeadlineSummary();

  ngOnInit(): void {
    this.checkPermessiInAttesa();
    this.loadDeadlineSummary();
    this.loadPendingQuoteReviews();
    this.bindQuoteAcceptanceUpdates();
  }

  ngOnDestroy(): void {
    this.quoteAcceptanceSubscription?.unsubscribe();
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

  loadDeadlineSummary(): void {
    this.http
      .get<any>(this.global.url + 'admin/deadlines/summary')
      .subscribe({
        next: (res) => {
          this.employeeDeadlineSummary = this.normalizeDeadlineSummary(
            res?.employees,
          );
          this.vehicleDeadlineSummary = this.normalizeDeadlineSummary(
            res?.vehicles,
          );
        },
        error: (err) => {
          console.error('Errore caricamento riepilogo scadenze:', err);
        },
      });
  }

  loadPendingQuoteReviews(): void {
    this.http
      .get<{ count: number }>(
        this.global.url + 'quotes/pendingOfficeReviewCount',
        {
          headers: this.global.headers,
        },
      )
      .subscribe({
        next: (res) => {
          this.pendingQuoteReviews = Number(res?.count) || 0;
        },
        error: (err) => {
          console.error(
            'Errore caricamento preventivi da verificare:',
            err,
          );
        },
      });
  }

  private bindQuoteAcceptanceUpdates(): void {
    if (this.quoteAcceptanceSubscription) {
      return;
    }

    this.quoteAcceptanceSubscription = this.socketService
      .onQuoteAcceptanceUpdate()
      .subscribe((update: any) => {
        this.loadPendingQuoteReviews();

        const numeroPreventivo = update?.numeroPreventivo || '';
        if (update?.kind === 'accepted') {
          this.snackBar.open(
            `Preventivo ${numeroPreventivo} accettato dal cliente`,
            'Chiudi',
            { duration: 5000 },
          );
        } else if (update?.kind === 'office_confirmed') {
          this.snackBar.open(
            `Preventivo ${numeroPreventivo} verificato dall'ufficio`,
            'Chiudi',
            { duration: 5000 },
          );
        }
      });
  }

  navigateToCalendarHome() {
    this.router.navigateByUrl('/calendarHome');
  }

  navigateToInternalDocuments() {
    this.router.navigateByUrl('/internal-documents');
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

  navigateToServiceOrders() {
    this.router.navigateByUrl('/service-orders');
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

  goToRiepilogoOreClienti() {
    this.router.navigate(['/riepilogo-ore-clienti']);
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

  navigateToEmployeeDeadlines() {
    this.router.navigateByUrl('/employee-deadlines');
  }

  navigateToVehicleDeadlines() {
    this.router.navigateByUrl('/vehicle-deadlines');
  }

  navigateToLeaveSettings() {
    this.router.navigateByUrl('/leave-settings');
  }

  navigateToVehiclesSettings() {
    this.router.navigateByUrl('/vehiclesSettings');
  }

  navigateToQuoteSettings() {
    this.router.navigateByUrl('/quoteSettings');
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    console.log('[AppComponent] Freccia indietro rilevata');
    this.authService.logout();
  }

  deadlineBadgeClass(summary: DeadlineSummary): string {
    if (summary.status === 'expired') return 'alert-badge alert-badge-expired';
    if (summary.status === 'warning') return 'alert-badge alert-badge-warning';
    return 'alert-badge';
  }

  private emptyDeadlineSummary(): DeadlineSummary {
    return {
      expiredCount: 0,
      warningCount: 0,
      alertCount: 0,
      totalCount: 0,
      status: 'ok',
    };
  }

  private normalizeDeadlineSummary(raw: any): DeadlineSummary {
    if (!raw) return this.emptyDeadlineSummary();

    return {
      expiredCount: Number(raw.expiredCount) || 0,
      warningCount: Number(raw.warningCount) || 0,
      alertCount: Number(raw.alertCount) || 0,
      totalCount: Number(raw.totalCount) || 0,
      status:
        raw.status === 'expired' || raw.status === 'warning'
          ? raw.status
          : 'ok',
    };
  }
}
