import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Subject, debounceTime } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-riepilogo-presenze-editabile',
  templateUrl: './riepilogo-presenze-editabile.component.html',
  styleUrls: ['./riepilogo-presenze-editabile.component.css'],
})
export class RiepilogoPresenzeEditabileComponent implements OnInit {
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
    public globalService: GlobalService,
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

  async caricaPresenze() {
    this.loading = true;

    try {
      // 1️⃣ GIORNI DEL MESE
      this.generaGiorni();

      // 2️⃣ RIEPILOGO UFFICIALE (base)
      const res: any = await this.http
        .get(
          `${this.globalService.url}admin/attendance/getMonthly/${this.meseSelezionato}/${this.annoSelezionato}`
        )
        .toPromise();

      const dipTmp = res?.dipendenti || [];

      // 3️⃣ NORMALIZZO STRUTTURA TIPOLGIE + NOTE
      dipTmp.forEach((d: any) => {
        if (!d.tipologie) d.tipologie = {};

        const numGiorni = this.giorni.length;

        const ensureArray = (arr: any) =>
          Array.isArray(arr) ? arr : Array(numGiorni).fill('');

        d.tipologie.Ordinario = ensureArray(d.tipologie.Ordinario);
        d.tipologie.Malattia = ensureArray(d.tipologie.Malattia);
        d.tipologie.Ferie = ensureArray(d.tipologie.Ferie);
        d.tipologie['Permessi/ROL'] = ensureArray(d.tipologie['Permessi/ROL']);
        d.tipologie['Assenza Ingiustificata'] = ensureArray(
          d.tipologie['Assenza Ingiustificata']
        );
        d.tipologie.Infortunio = ensureArray(d.tipologie.Infortunio);

        if (!d.note) d.note = '';
      });

      // 4️⃣ ASSEGNO AL TEMPLATE
      this.dipendenti = dipTmp;

      // 5️⃣ INIZIALIZZO CATEGORIE + ORE BASE (da riepilogo ufficiale)
      this.dipendenti.forEach((d) => {
        d.categorie = [];
        d.ore = [];

        for (let i = 0; i < this.giorni.length; i++) {
          const ordin = d.tipologie.Ordinario[i] ?? '';
          const ferie = d.tipologie.Ferie[i] ?? '';
          const mal = d.tipologie.Malattia[i] ?? '';
          const perm = d.tipologie['Permessi/ROL'][i] ?? '';
          const ass = d.tipologie['Assenza Ingiustificata'][i] ?? '';
          const inf = d.tipologie.Infortunio[i] ?? '';

          // 🔹 Caso 1: nessun valore → default Ordinario vuoto
          if (!ordin) {
            d.categorie[i] = 'O';
            d.ore[i] = '';
            continue;
          }

          // 🔹 Caso 2: valore numerico → ordinario con ore
          if (!isNaN(Number(ordin))) {
            d.categorie[i] = 'O';
            d.ore[i] = ordin;
            continue;
          }

          // 🔹 Caso 3: sigla categoria (F, M, P, AI, INF)
          d.categorie[i] = ordin;

          switch (ordin) {
            case 'F':
              d.ore[i] = ferie || '';
              break;
            case 'M':
              d.ore[i] = mal || '';
              break;
            case 'P':
              d.ore[i] = perm || '';
              break;
            case 'AI':
              d.ore[i] = ass || '';
              break;
            case 'INF':
              d.ore[i] = inf || '';
              break;
            default:
              d.ore[i] = '';
              break;
          }
        }
      });

      // 6️⃣ APPLICO MODIFICHE MANUALI CELLE (AttendanceEditableCell)
      const edits: any = await this.http
        .get(
          `${this.globalService.url}admin/attendanceEdit/getEditable/${this.meseSelezionato}/${this.annoSelezionato}`
        )
        .toPromise();

      (edits || []).forEach((cell: any) => {
        const dip = this.dipendenti.find((d) => d.id === cell.employeeId);
        if (!dip) return;

        const index = cell.giorno - 1;
        if (index < 0 || index >= this.giorni.length) return;

        // 👇 Si aspetta che il backend salvi categoria + ore
        dip.categorie[index] = cell.categoria || 'O';
        dip.ore[index] = cell.ore || '';

        // Se vuoi riflettere anche in tipologie (non obbligatorio per la UI, ma pulito):
        dip.tipologie.Ferie[index] = '';
        dip.tipologie.Malattia[index] = '';
        dip.tipologie['Permessi/ROL'][index] = '';
        dip.tipologie['Assenza Ingiustificata'][index] = '';
        dip.tipologie.Infortunio[index] = '';

        if (cell.categoria === 'O') {
          dip.tipologie.Ordinario[index] = cell.ore || '';
        } else {
          dip.tipologie.Ordinario[index] = cell.categoria;

          switch (cell.categoria) {
            case 'F':
              dip.tipologie.Ferie[index] = cell.ore || '';
              break;
            case 'M':
              dip.tipologie.Malattia[index] = cell.ore || '';
              break;
            case 'P':
              dip.tipologie['Permessi/ROL'][index] = cell.ore || '';
              break;
            case 'AI':
              dip.tipologie['Assenza Ingiustificata'][index] = cell.ore || '';
              break;
            case 'INF':
              dip.tipologie.Infortunio[index] = cell.ore || '';
              break;
          }
        }
      });

      // 7️⃣ APPLICO NOTE MANUALI (AttendanceEditableNote)
      const noteEdits: any = await this.http
        .get(
          `${this.globalService.url}admin/attendanceEdit/getEditableNotes/${this.meseSelezionato}/${this.annoSelezionato}`
        )
        .toPromise();

      (noteEdits || []).forEach((n: any) => {
        const dip = this.dipendenti.find((d) => d.id === n.employeeId);
        if (dip) dip.note = n.nota ?? '';
      });
    } catch (err) {
      console.error('❌ Errore caricamento presenze editabili:', err);
    } finally {
      this.loading = false;
    }
  }

  cambiaMeseAnno() {
    this.generaGiorni();
    this.caricaPresenze();
  }

  // 🔵 QUANDO CAMBIA UNA CELLA (giorno specifico)
  onCellaChange(d: any, i: number) {
    const categoria = d.categorie[i];
    const ore = d.ore[i];

    this.http
      .post(`${this.globalService.url}admin/attendanceEdit/saveEditableCell`, {
        employeeId: d.id,
        giorno: i + 1,
        mese: this.meseSelezionato,
        anno: this.annoSelezionato,
        categoria,
        ore,
      })
      .subscribe();
  }

  // 🔵 AUTOSAVE NOTE con debounce
  onNotaChange(dip: any) {
    const id = dip.id;

    if (!this.noteChanges[id]) {
      this.noteChanges[id] = new Subject<string>();

      this.noteChanges[id]
        .pipe(debounceTime(700))
        .subscribe((val) => this.salvaNotaSingola(dip, val));
    }

    this.noteChanges[id].next(dip.note);
  }

  async salvaNotaSingola(dip: any, nota: string) {
    try {
      await this.http
        .post(
          `${this.globalService.url}admin/attendanceEdit/saveEditableNote`,
          {
            employeeId: dip.id,
            mese: this.meseSelezionato,
            anno: this.annoSelezionato,
            nota,
          }
        )
        .toPromise();

      console.log('✔ Nota salvata');
    } catch (err) {
      console.error('❌ Errore salvataggio nota editabile:', err);
    }
  }
  async generaPdf() {
    const body = {
      mese: this.meseSelezionato,
      anno: this.annoSelezionato,
    };

    const res: any = await this.http
      .post(`${this.globalService.url}admin/attendanceEdit/generatePdf`, body)
      .toPromise();

    if (res?.url) window.open(res.url, '_blank');
  }

  back() {
    this.router.navigate(['/homeAdmin']);
  }
}
