import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timbrature-dettaglio',
  templateUrl: './timbrature-dettaglio.component.html',
  styleUrls: ['./timbrature-dettaglio.component.css'],
})
export class TimbratureDettaglioComponent implements OnInit {
  employeeId!: number;
  employee: any;
  date!: string;
  works: any[] = [];
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public global: GlobalService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('employeeId'));
    this.date = this.route.snapshot.paramMap.get('date')!;
    this.loadTimbrature();
  }

  // 🔹 Carica i dati del dipendente e le timbrature del giorno
  loadTimbrature() {
    this.loading = true;
    this.http
      .get<any>(
        `${this.global.url}admin/stamping/${this.employeeId}/${this.date}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      )
      .subscribe({
        next: (res) => {
          this.employee = res.employee;
          this.works = res.works;
          this.loading = false;
        },
        error: (err) => {
          console.error('Errore caricamento timbrature:', err);
          this.loading = false;
        },
      });
  }

  // 🔹 Cambia data
  changeDate(delta: number): void {
    const current = new Date(this.date);
    current.setDate(current.getDate() + delta);
    this.date = current.toISOString().split('T')[0];
    this.router.navigate(['/timbratureDettaglio', this.employeeId, this.date]);
    this.loadTimbrature();
  }

  // 🔹 Aggiungi nuova timbratura
  addStamping(work: any) {
    const entrata = prompt('Orario di entrata (HH:mm):', '');
    if (!entrata) return;
    const uscita = prompt('Orario di uscita (HH:mm):', '');
    const note = prompt('Motivo dell’aggiunta:', '');

    const body: any = {
      employeeId: this.employeeId,
      customerId: work.customerId,
      date: this.date,
      entrata,
      uscita,
      note,
    };

    this.http
      .post(`${this.global.url}admin/stamping/add`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .subscribe({
        next: () => {
          alert('Timbratura aggiunta con successo.');
          this.loadTimbrature();
        },
        error: (err) => {
          console.error('Errore aggiunta timbratura:', err);
          alert('Errore durante il salvataggio della timbratura.');
        },
      });
  }

  // 🔹 Modifica o elimina una timbratura
  editStamping(stamp: any) {
    const choice = prompt(
      'Vuoi MODIFICARE (M) o ELIMINARE (E) questa timbratura?',
      'M'
    );

    if (!choice) return;

    if (choice.toUpperCase() === 'E') {
      const note = prompt('Motivo eliminazione:', '');
      this.http
        .delete(`${this.global.url}admin/stamping/delete/${stamp.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: { note },
        })
        .subscribe({
          next: () => {
            alert('Timbratura eliminata.');
            this.loadTimbrature();
          },
          error: (err) => {
            console.error('Errore eliminazione:', err);
            alert('Errore durante l’eliminazione.');
          },
        });
    } else {
      const time = prompt(
        'Inserisci nuovo orario (HH:mm) o lascia vuoto per annullare:',
        ''
      );
      if (!time) return;
      const note = prompt('Motivo modifica:', '');
      const body = {
        date: this.date,
        time,
        note,
      };

      this.http
        .put(`${this.global.url}admin/stamping/edit/${stamp.id}`, body, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .subscribe({
          next: () => {
            alert('Timbratura modificata.');
            this.loadTimbrature();
          },
          error: (err) => {
            console.error('Errore modifica:', err);
            alert('Errore durante la modifica.');
          },
        });
    }
  }

  // 🔹 Risolvi errore su un lavoro
  resolveError(work: any) {
    // Caso speciale: Turno non previsto
    if (work.errorType === 'TURNO_NON_PREVISTO') {
      const choice = prompt(
        'Timbratura su turno non pianificato. Scegli azione:\n1) Ignora errore\n2) Crea turno automatico',
        '1'
      );
      if (!choice) return;

      if (choice === '2') {
        alert('→ Creazione automatica turno non ancora implementata.');
      } else {
        alert('→ Errore ignorato.');
      }
      return;
    }

    // Altri errori (già gestiti)
    const action = prompt(
      `Errore "${work.errorType}" - Scegli azione:\n1) ${work.solutions[0]?.label}\n2) ${work.solutions[1]?.label}`,
      '1'
    );

    if (!action) return;
    const selected =
      action === '1' ? work.solutions[0]?.code : work.solutions[1]?.code;
    const note = prompt('Motivo decisione:', '');

    this.http
      .post(
        `${this.global.url}admin/stamping/resolveError`,
        {
          employeeId: this.employeeId,
          date: this.date,
          shiftId: work.shiftId,
          action: selected,
          note,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      )
      .subscribe({
        next: () => {
          alert('Errore risolto.');
          this.loadTimbrature();
        },
        error: (err) => {
          console.error('Errore risoluzione:', err);
          alert('Errore durante la risoluzione.');
        },
      });
  }

  back(): void {
    this.location.back();
  }
}
