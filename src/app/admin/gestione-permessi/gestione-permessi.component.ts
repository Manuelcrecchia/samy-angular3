import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-gestione-permessi',
  templateUrl: './gestione-permessi.component.html',
  styleUrls: ['./gestione-permessi.component.css'],
})
export class GestionePermessiComponent implements OnInit {
  @ViewChild('permessoModal') modalElement!: ElementRef;
  @ViewChild('creaModal') creaModalElement!: ElementRef;

  leaveRequests: any[] = [];
  employees: any[] = [];
  loading = false;
  selectedRequest: any = null;
  creaLoading = false;

  modalData: any = {
    categoria: 'Ferie',
    oreGiornaliere: null,
    oraInizioModificata: '',
    oraFineModificata: '',
  };

  creaData: any = {
    employeeId: '',
    categoria: 'Ferie',
    tipoPermesso: 'giornaliero',
    fromDate: '',
    toDate: '',
    oraInizio: '',
    oraFine: '',
  };

  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.http.get<any[]>(this.globalService.url + 'employees/getAll').subscribe({
      next: (res) => { this.employees = res.filter((e) => e.active !== false); },
      error: () => {},
    });
  }

  openCreaModal(): void {
    this.creaData = {
      employeeId: '',
      categoria: 'Ferie',
      tipoPermesso: 'giornaliero',
      fromDate: '',
      toDate: '',
      oraInizio: '',
      oraFine: '',
      oreGiornaliere: null,
    };
    const modal = new bootstrap.Modal(this.creaModalElement.nativeElement);
    modal.show();
  }

  onCreaFromDateChange(): void {
    if (this.creaData.tipoPermesso !== 'settimanale') {
      this.creaData.toDate = this.creaData.fromDate;
    }
  }

  onCreaTipoChange(): void {
    if (this.creaData.tipoPermesso !== 'settimanale') {
      this.creaData.toDate = this.creaData.fromDate;
    }
    if (this.creaData.tipoPermesso === 'parziale') {
      this.creaData.oraInizio = '';
      this.creaData.oraFine = '';
      this.creaData.oreGiornaliere = null;
    } else {
      this.creaData.oraInizio = '';
      this.creaData.oraFine = '';
    }
  }

  submitCreaPermesso(): void {
    if (!this.creaData.employeeId || !this.creaData.fromDate) {
      this.showToast('❌ Compilare tutti i campi obbligatori', true);
      return;
    }
    if (this.creaData.tipoPermesso === 'parziale' && (!this.creaData.oraInizio || !this.creaData.oraFine)) {
      this.showToast('❌ Inserire orario di inizio e fine per permesso parziale', true);
      return;
    }
    if (this.creaData.tipoPermesso === 'settimanale' && !this.creaData.toDate) {
      this.showToast('❌ Inserire data di fine per permesso settimanale', true);
      return;
    }
    this.creaLoading = true;
    this.http.post(this.globalService.url + 'permission/admin-create', this.creaData).subscribe({
      next: () => {
        this.creaLoading = false;
        bootstrap.Modal.getInstance(this.creaModalElement.nativeElement)?.hide();
        this.showToast('✅ Richiesta inviata al dipendente per conferma');
      },
      error: (err) => {
        this.creaLoading = false;
        this.showToast('❌ ' + (err.error?.error || 'Errore durante la creazione'), true);
      },
    });
  }

  loadRequests(): void {
    this.loading = true;
    this.http.get<any[]>(this.globalService.url + 'permission').subscribe({
      next: (res) => {
        this.leaveRequests = res.filter((p) => p.status === 'in attesa');
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel recupero permessi:', err);
        this.loading = false;
      },
    });
  }

  openModal(req: any): void {
    this.selectedRequest = req;
    this.modalData = {
      categoria: 'Ferie',
      oreGiornaliere: null,
      oraInizioModificata: req.tipoPermesso === 'parziale' ? (req.oraInizio || '') : '',
      oraFineModificata: req.tipoPermesso === 'parziale' ? (req.oraFine || '') : '',
    };
    const modal = new bootstrap.Modal(this.modalElement.nativeElement);
    modal.show();
  }

  confirmAccept(): void {
    if (!this.selectedRequest) return;

    const body: any = {
      id: this.selectedRequest.id,
      employeeId: this.selectedRequest.employeeId,
      categoria: this.modalData.categoria,
      dataInizio: this.selectedRequest.fromDate,
      dataFine: this.selectedRequest.toDate,
      oreGiornaliere: this.modalData.oreGiornaliere,
    };

    if (this.selectedRequest.tipoPermesso === 'parziale') {
      body.oraInizioModificata = this.modalData.oraInizioModificata || null;
      body.oraFineModificata = this.modalData.oraFineModificata || null;
    }

    this.http
      .post(this.globalService.url + 'permission/accept', body)
      .subscribe({
        next: (res: any) => {
          const wasModified =
            this.selectedRequest?.tipoPermesso === 'parziale' &&
            this.modalData.oraInizioModificata &&
            this.modalData.oraFineModificata &&
            (this.modalData.oraInizioModificata !== this.selectedRequest?.oraInizio ||
              this.modalData.oraFineModificata !== this.selectedRequest?.oraFine);

          this.showToast(
            wasModified
              ? `⚠️ Ore modificate inviate al dipendente per conferma`
              : `✅ Permesso accettato come ${this.modalData.categoria}${
                  this.modalData.oreGiornaliere
                    ? ' (' + this.modalData.oreGiornaliere + ' ore)'
                    : ''
                }`
          );
          const modal = bootstrap.Modal.getInstance(
            this.modalElement.nativeElement
          );
          modal.hide();
          this.loadRequests();
        },
        error: (err) => {
          console.error('Errore durante accettazione:', err);
          this.showToast('❌ Errore durante l’accettazione', true);
        },
      });
  }

  rifiuta(id: number): void {
    this.http
      .post(this.globalService.url + 'permission/reject', { id })
      .subscribe({
        next: () => {
          this.showToast('🗑️ Permesso rifiutato');
          this.loadRequests();
        },
        error: (err) => {
          console.error('Errore durante rifiuto:', err);
          this.showToast('❌ Errore durante il rifiuto', true);
        },
      });
  }

  showToast(message: string, error: boolean = false): void {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastBody');
    if (!toastEl || !toastBody) return;
    toastBody.textContent = message;
    toastEl.className = `toast align-items-center text-bg-${
      error ? 'danger' : 'success'
    } border-0`;
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
  }

  goBack(): void {
    this.router.navigate(['homeAdmin']);
  }
}
