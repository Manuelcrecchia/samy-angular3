import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../../service/global.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-categoria-modal',
  templateUrl: './categoria-modal.component.html',
  styleUrls: ['./categoria-modal.component.css'],
})
export class CategoriaModalComponent {
  @Input() emp: any; // Riceve il dipendente dal componente padre

  categoria: string = '';
  dataInizio: string = '';
  dataFine: string = '';
  oreGiornaliere: number | null = null;

  categorie = [
    'Malattia',
    'Ferie',
    'Permessi/ROL',
    'Assenza Ingiustificata',
    'Infortunio',
  ];

  saving = false;

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    public activeModal: NgbActiveModal
  ) {}

  salvaCategoria() {
    if (!this.categoria || !this.dataInizio || !this.dataFine) {
      alert('Compila tutti i campi');
      return;
    }

    const body = {
      employeeId: this.emp.id,
      categoria: this.categoria,
      dataInizio: this.dataInizio,
      dataFine: this.dataFine,
      oreGiornaliere: this.oreGiornaliere ?? 0, // opzionale
    };

    this.saving = true;
    this.http
      .post(`${this.globalService.url}admin/attendance/addCategory`, body, {
        headers: this.globalService.headers,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.activeModal.close('salvato');
        },
        error: () => {
          this.saving = false;
          alert('Errore durante il salvataggio della categoria');
        },
      });
  }

  chiudi() {
    this.activeModal.dismiss();
  }
}
