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

  leaveRequests: any[] = [];
  loading = false;
  selectedRequest: any = null;
  modalData: any = {
    categoria: 'Ferie',
    oreGiornaliere: null,
    oraInizioModificata: '',
    oraFineModificata: '',
  };

  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
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
