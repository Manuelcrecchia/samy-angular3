import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { saveAs } from 'file-saver';
import { Subject, debounceTime, lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-riepilogo-presenze',
  templateUrl: './riepilogo-presenze.component.html',
  styleUrls: ['./riepilogo-presenze.component.css'],
})
export class RiepilogoPresenzeComponent implements OnInit {
  mesi = [
    { nome: 'Gennaio', valore: '01' },
    { nome: 'Febbraio', valore: '02' },
    { nome: 'Marzo', valore: '03' },
    { nome: 'Aprile', valore: '04' },
    { nome: 'Maggio', valore: '05' },
    { nome: 'Giugno', valore: '06' },
    { nome: 'Luglio', valore: '07' },
    { nome: 'Agosto', valore: '08' },
    { nome: 'Settembre', valore: '09' },
    { nome: 'Ottobre', valore: '10' },
    { nome: 'Novembre', valore: '11' },
    { nome: 'Dicembre', valore: '12' },
  ];

  meseSelezionato = (new Date().getMonth() + 1).toString().padStart(2, '0');
  annoSelezionato = new Date().getFullYear();
  dipendenti: any[] = [];
  giorni: string[] = [];

  loading = false;
  private noteChanges: { [id: number]: Subject<string> } = {};

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.generaGiorni();
    this.caricaPresenze();
  }

  generaGiorni() {
    const year = +this.annoSelezionato;
    const month = +this.meseSelezionato;
    const numGiorni = new Date(year, month, 0).getDate();
    this.giorni = Array.from({ length: numGiorni }, (_, i) =>
      (i + 1).toString().padStart(2, '0')
    );
  }

  caricaPresenze() {
    this.loading = true;
    this.http
      .get(
        `${this.globalService.url}admin/attendance/getMonthly/${this.meseSelezionato}/${this.annoSelezionato}`
      )
      .subscribe({
        next: (res: any) => {
          this.dipendenti = res.dipendenti || [];
          this.generaGiorni();
          this.loading = false;
        },
        error: (err) => {
          console.error('Errore caricamento presenze:', err);
          this.loading = false;
        },
      });
  }

  cambiaMeseAnno() {
    this.generaGiorni();
    this.caricaPresenze();
  }

  async generaPdf() {
    this.loading = true;
    try {
      const body = {
        mese: this.meseSelezionato,
        anno: this.annoSelezionato,
        dipendenti: this.dipendenti,
      };

      // 1) genera PDF lato server
      await lastValueFrom(
        this.http.post(
          `${this.globalService.url}admin/attendance/generatePdf`,
          body
        )
      );

      // 2) scarica come BLOB (stile preventivi)
      const blob = await lastValueFrom(
        this.http.post(
          `${this.globalService.url}admin/attendance/downloadSecure`,
          { mese: this.meseSelezionato, anno: this.annoSelezionato },
          { responseType: 'blob' }
        )
      );

      const filename = `Presenze_${this.annoSelezionato}-${this.meseSelezionato}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Errore generazione/scarico PDF:', err);
      alert('Errore durante la generazione o il download del PDF.');
    } finally {
      this.loading = false;
    }
  }

  onNotaChange(dipendente: any) {
    console.log('in');
    const id = dipendente.id;
    if (!this.noteChanges[id]) {
      this.noteChanges[id] = new Subject<string>();
      this.noteChanges[id]
        .pipe(debounceTime(1000))
        .subscribe((val) => this.salvaNotaSingola(dipendente, val));
    }
    this.noteChanges[id].next(dipendente.note);
  }

  async salvaNotaSingola(dipendente: any, nota: string) {
    try {
      const body = {
        mese: this.meseSelezionato,
        anno: this.annoSelezionato,
        employeeId: dipendente.id,
        nota,
      };

      await this.http
        .post(`${this.globalService.url}admin/attendance/saveNote`, body)
        .toPromise();

      console.log(`💾 Nota salvata per ${dipendente.nome}`);
    } catch (err) {
      console.error(`❌ Errore salvataggio nota per ${dipendente.nome}:`, err);
    }
  }

  back() {
    this.router.navigate(['/homeAdmin']);
  }
}
