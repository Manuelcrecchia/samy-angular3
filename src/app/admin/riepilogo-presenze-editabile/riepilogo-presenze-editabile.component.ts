import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Subject, debounceTime, lastValueFrom } from 'rxjs';
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
  dipendentiSelezionati: Set<number> = new Set();

  private noteChanges: { [id: number]: Subject<string> } = {};

  // Mappa categorie codice -> nome tipologia
  private catMap: { [key: string]: string } = {
    O: 'Ordinario',
    F: 'Ferie',
    M: 'Malattia',
    P: 'Permessi/ROL',
    AI: 'Assenza Ingiustificata',
    INF: 'Infortunio',
  };

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
      this.dipendentiSelezionati = new Set(dipTmp.map((d: any) => d.id));

      // 5️⃣ INIZIALIZZO VOCI GIORNO (struttura per giornate miste)
      // Ogni giorno può avere multiple voci: [{categoria: 'O', ore: '4'}, {categoria: 'P', ore: '4'}]
      this.dipendenti.forEach((d) => {
        d.vociGiorno = []; // Array di array: vociGiorno[giornoIndex] = [{categoria, ore}, ...]

        for (let i = 0; i < this.giorni.length; i++) {
          const voci: any[] = [];

          // Controlliamo ogni tipologia e creiamo voci per i valori presenti
          const ordin = d.tipologie.Ordinario[i];
          const ferie = d.tipologie.Ferie[i];
          const mal = d.tipologie.Malattia[i];
          const perm = d.tipologie['Permessi/ROL'][i];
          const ass = d.tipologie['Assenza Ingiustificata'][i];
          const inf = d.tipologie.Infortunio[i];

          // 🔹 Ordinario (può essere numero o stringa vuota)
          if (ordin && !isNaN(Number(ordin)) && Number(ordin) > 0) {
            voci.push({ categoria: 'O', ore: String(ordin) });
          }

          // 🔹 Altre categorie
          if (ferie && (String(ferie).trim() !== '' || ferie === 'F')) {
            voci.push({ categoria: 'F', ore: !isNaN(Number(ferie)) ? String(ferie) : '' });
          }
          if (mal && (String(mal).trim() !== '' || mal === 'M')) {
            voci.push({ categoria: 'M', ore: !isNaN(Number(mal)) ? String(mal) : '' });
          }
          if (perm && (String(perm).trim() !== '' || perm === 'P')) {
            voci.push({ categoria: 'P', ore: !isNaN(Number(perm)) ? String(perm) : '' });
          }
          if (ass && (String(ass).trim() !== '' || ass === 'AI')) {
            voci.push({ categoria: 'AI', ore: !isNaN(Number(ass)) ? String(ass) : '' });
          }
          if (inf && (String(inf).trim() !== '' || inf === 'INF')) {
            voci.push({ categoria: 'INF', ore: !isNaN(Number(inf)) ? String(inf) : '' });
          }

          // Se non ci sono voci, aggiungiamo una voce vuota di default
          if (voci.length === 0) {
            voci.push({ categoria: 'O', ore: '' });
          }

          d.vociGiorno[i] = voci;
        }

        // Manteniamo categorie e ore per retrocompatibilità
        d.categorie = [];
        d.ore = [];
        for (let i = 0; i < this.giorni.length; i++) {
          const primaVoce = d.vociGiorno[i]?.[0];
          d.categorie[i] = primaVoce?.categoria || 'O';
          d.ore[i] = primaVoce?.ore || '';
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

        // 👇 Supporto nuovo formato con voci multiple
        if (cell.voci && Array.isArray(cell.voci)) {
          // Nuovo formato: array di voci
          dip.vociGiorno[index] = cell.voci.map((v: any) => ({
            categoria: v.categoria || 'O',
            ore: v.ore || '',
          }));
        } else {
          // Vecchio formato: singola categoria + ore
          dip.vociGiorno[index] = [
            { categoria: cell.categoria || 'O', ore: cell.ore || '' },
          ];
        }

        // Aggiorna anche categorie/ore per retrocompatibilità
        dip.categorie[index] = cell.categoria || 'O';
        dip.ore[index] = cell.ore || '';

        // Sincronizza con tipologie
        dip.tipologie.Ferie[index] = '';
        dip.tipologie.Malattia[index] = '';
        dip.tipologie['Permessi/ROL'][index] = '';
        dip.tipologie['Assenza Ingiustificata'][index] = '';
        dip.tipologie.Infortunio[index] = '';
        dip.tipologie.Ordinario[index] = '';

        // Processa tutte le voci per aggiornare le tipologie
        const voci = dip.vociGiorno[index];
        voci.forEach((voce: any) => {
          const oreVal = voce.ore || '';

          switch (voce.categoria) {
            case 'O':
              if (oreVal) {
                const curr = dip.tipologie.Ordinario[index];
                dip.tipologie.Ordinario[index] = curr
                  ? String(Number(curr) + Number(oreVal))
                  : String(oreVal);
              }
              break;
            case 'F':
              dip.tipologie.Ferie[index] = oreVal || 'F';
              break;
            case 'M':
              dip.tipologie.Malattia[index] = oreVal || 'M';
              break;
            case 'P':
              dip.tipologie['Permessi/ROL'][index] = oreVal || 'P';
              break;
            case 'AI':
              dip.tipologie['Assenza Ingiustificata'][index] = oreVal || 'AI';
              break;
            case 'INF':
              dip.tipologie.Infortunio[index] = oreVal || 'INF';
              break;
          }
        });
      });

      // Ricalcola totale dopo aver applicato gli override celle
      this.dipendenti.forEach((d) => this.ricalcolaTotale(d));

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
      alert('Errore durante il caricamento delle presenze');
    } finally {
      this.loading = false;
    }
  }

  toggleDipendente(id: number) {
    if (this.dipendentiSelezionati.has(id)) {
      this.dipendentiSelezionati.delete(id);
    } else {
      this.dipendentiSelezionati.add(id);
    }
  }

  cambiaMeseAnno() {
    this.generaGiorni();
    this.caricaPresenze();
  }

  // 🔵 QUANDO CAMBIA UNA CELLA (giorno specifico)
  onCellaChange(d: any, i: number) {
    const voci = d.vociGiorno[i] || [];

    // Aggiorna categorie/ore per retrocompatibilità
    const primaVoce = voci[0];
    if (primaVoce) {
      d.categorie[i] = primaVoce.categoria;
      d.ore[i] = primaVoce.ore;
    }

    // Sincronizza con tipologie e ricalcola totale
    this.sincronizzaTipologie(d, i);
    this.ricalcolaTotale(d);

    this.http
      .post(`${this.globalService.url}admin/attendanceEdit/saveEditableCell`, {
        employeeId: d.id,
        giorno: i + 1,
        mese: this.meseSelezionato,
        anno: this.annoSelezionato,
        voci: voci.map((v: any) => ({ categoria: v.categoria, ore: v.ore })),
        // Manteniamo anche i vecchi campi per retrocompatibilità
        categoria: primaVoce?.categoria || 'O',
        ore: primaVoce?.ore || '',
      })
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Errore salvataggio cella:', err);
          alert(this.parseServerError(err));
        },
      });
  }

  // 🔵 AGGIUNGI VOCE A UN GIORNO
  aggiungiVoce(d: any, i: number) {
    if (!d.vociGiorno[i]) {
      d.vociGiorno[i] = [];
    }
    d.vociGiorno[i].push({ categoria: 'O', ore: '' });
    this.onCellaChange(d, i);
  }

  // 🔵 RIMUOVI VOCE DA UN GIORNO
  rimuoviVoce(d: any, i: number, vIndex: number) {
    if (d.vociGiorno[i] && d.vociGiorno[i].length > vIndex) {
      d.vociGiorno[i].splice(vIndex, 1);
      // Se non ci sono più voci, aggiungi una voce vuota di default
      if (d.vociGiorno[i].length === 0) {
        d.vociGiorno[i].push({ categoria: 'O', ore: '' });
      }
      this.onCellaChange(d, i);
    }
  }

  // 🔵 RICALCOLA TOTALE ORE ORDINARIO
  private ricalcolaTotale(d: any) {
    let total = 0;
    (d.tipologie.Ordinario || []).forEach((val: any) => {
      const n = parseFloat(val);
      if (!isNaN(n) && n > 0) total += n;
    });
    const h = Math.floor(total);
    const c = Math.round((total - h) * 100);
    d.totale = c === 0 ? `${h}` : `${h}.${String(c).padStart(2, '0')}`;
  }

  // 🔵 SINCRONIZZA VOCI CON TIPOLOGIE
  private sincronizzaTipologie(d: any, i: number) {
    const voci = d.vociGiorno[i] || [];

    // Reset tipologie
    d.tipologie.Ordinario[i] = '';
    d.tipologie.Ferie[i] = '';
    d.tipologie.Malattia[i] = '';
    d.tipologie['Permessi/ROL'][i] = '';
    d.tipologie['Assenza Ingiustificata'][i] = '';
    d.tipologie.Infortunio[i] = '';

    // Accumula ore per categoria
    let oreOrdinario = 0;
    voci.forEach((voce: any) => {
      const ore = parseFloat(voce.ore) || 0;

      switch (voce.categoria) {
        case 'O':
          oreOrdinario += ore;
          break;
        case 'F':
          d.tipologie.Ferie[i] = voce.ore || 'F';
          break;
        case 'M':
          d.tipologie.Malattia[i] = voce.ore || 'M';
          break;
        case 'P':
          d.tipologie['Permessi/ROL'][i] = voce.ore || 'P';
          break;
        case 'AI':
          d.tipologie['Assenza Ingiustificata'][i] = voce.ore || 'AI';
          break;
        case 'INF':
          d.tipologie.Infortunio[i] = voce.ore || 'INF';
          break;
      }
    });

    if (oreOrdinario > 0) {
      d.tipologie.Ordinario[i] = String(oreOrdinario);
    }
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
      alert(this.parseServerError(err));
    }
  }

  async generaPdf() {
    this.loading = true;
    try {
      const excludeIds = this.dipendenti
        .filter((d) => !this.dipendentiSelezionati.has(d.id))
        .map((d) => d.id);

      const body: any = {
        mese: this.meseSelezionato,
        anno: this.annoSelezionato,
      };
      if (excludeIds.length > 0) body.excludeIds = excludeIds;

      // 1) genera PDF lato server
      await lastValueFrom(
        this.http.post(
          `${this.globalService.url}admin/attendanceEdit/generatePdf`,
          body
        )
      );

      // 2) scarica blob senza token
      const blob = await lastValueFrom(
        this.http.post(
          `${this.globalService.url}admin/attendanceEdit/downloadSecure`,
          body,
          { responseType: 'blob' }
        )
      );

      const filename = `Presenze_${this.annoSelezionato}-${this.meseSelezionato}_EDITABILE.pdf`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Errore generazione/scarico PDF EDITABILE:', err);
      alert('Errore durante la generazione o il download del PDF editabile.');
    } finally {
      this.loading = false;
    }
  }

  back() {
    this.router.navigate(['/homeAdmin']);
  }

  private parseServerError(err: any): string {
    try {
      const body = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
      if (body?.error) return body.error;
    } catch {}
    if (err.status === 0) return 'Impossibile connettersi al server';
    return 'Errore imprevisto. Riprova.';
  }
}
