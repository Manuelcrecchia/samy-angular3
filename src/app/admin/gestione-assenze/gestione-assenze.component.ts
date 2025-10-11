import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-gestione-assenze',
  templateUrl: './gestione-assenze.component.html',
  styleUrls: ['./gestione-assenze.component.css'],
})
export class GestioneAssenzeComponent implements OnInit {
  employeeId!: number;
  assenze: any[] = [];
  nuovaAssenza = {
    dataInizio: '',
    dataFine: '',
    categoria: '',
    oreGiornaliere: '',
  };
  categorie = [
    'Malattia',
    'Ferie',
    'Permessi/ROL',
    'Assenza Ingiustificata',
    'Infortunio',
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private global: GlobalService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.employeeId = params['employeeId'];
      if (this.employeeId) this.loadAssenze();
    });
  }

  goBack() {
    this.router.navigateByUrl('/gestioneemployees');
  }

  loadAssenze() {
    this.http
      .get(this.global.url + 'admin/attendanceCategory/get/' + this.employeeId)
      .subscribe({
        next: (data: any) => (this.assenze = data),
        error: (err) => console.error('Errore caricamento assenze:', err),
      });
  }

  addAssenza() {
    const payload = { ...this.nuovaAssenza, employeeId: this.employeeId };

    this.http
      .post(this.global.url + 'admin/attendanceCategory/add', payload)
      .subscribe({
        next: () => {
          this.loadAssenze();
          this.nuovaAssenza = {
            dataInizio: '',
            dataFine: '',
            categoria: '',
            oreGiornaliere: '',
          };
        },
        error: (err) => {
          console.error('Errore creazione assenza:', err);
          if (err.status === 409) {
            alert("⚠️ Esiste già un'assenza per questo periodo!");
          } else {
            alert("❌ Errore durante la creazione dell'assenza");
          }
        },
      });
  }

  updateAssenza(a: any) {
    this.http
      .post(this.global.url + 'admin/attendanceCategory/update/' + a.id, a)
      .subscribe({
        next: () => this.loadAssenze(),
        error: (err) => console.error('Errore aggiornamento:', err),
      });
  }

  deleteAssenza(id: number) {
    if (confirm('Vuoi davvero eliminare questa assenza?')) {
      this.http
        .post(this.global.url + 'admin/attendanceCategory/delete/' + id, {})
        .subscribe({
          next: () => this.loadAssenze(),
          error: (err) => console.error('Errore eliminazione:', err),
        });
    }
  }
}
