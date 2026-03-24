import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { Location } from '@angular/common';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

export interface AllegatoNota {
  nome: string;
  base64: string;
  mimeType: string;
}

export interface NotaCliente {
  id?: number;
  numeroCliente: string;
  operatore: string;
  data: string;
  ora: string;
  testo: string;
  allegati: AllegatoNota[];
}

@Component({
  selector: 'app-customer-notes',
  templateUrl: './customer-notes.component.html',
  styleUrl: './customer-notes.component.css',
})
export class CustomerNotesComponent implements OnInit {
  numeroCliente = '';
  nominativo = '';
  note: NotaCliente[] = [];
  nuovaNota = '';
  nuoviAllegati: AllegatoNota[] = [];
  loading = false;
  sending = false;

  // ── Filtri ──────────────────────────────────────
  soloAllegati = false;
  showSearch = false;
  searchText = '';
  showDateFilter = false;
  dateFrom = '';
  dateTo = '';
  filterOperatore = '';

  get operatoriDisponibili(): string[] {
    const set = new Set(this.note.map(n => n.operatore).filter(Boolean));
    return Array.from(set).sort();
  }

  get noteFiltrate(): NotaCliente[] {
    let result = [...this.note];

    if (this.soloAllegati) {
      result = result.filter(n => n.allegati && n.allegati.length > 0);
    }

    if (this.searchText.trim()) {
      const q = this.normalize(this.searchText);
      result = result.filter(n => this.normalize(n.testo).includes(q));
    }

    if (this.filterOperatore) {
      result = result.filter(n => n.operatore === this.filterOperatore);
    }

    if (this.dateFrom || this.dateTo) {
      result = result.filter(n => {
        const noteDate = this.parseDateIT(n.data);
        if (!noteDate) return true;
        if (this.dateFrom) {
          const from = new Date(this.dateFrom);
          from.setHours(0, 0, 0, 0);
          if (noteDate < from) return false;
        }
        if (this.dateTo) {
          const to = new Date(this.dateTo);
          to.setHours(23, 59, 59, 999);
          if (noteDate > to) return false;
        }
        return true;
      });
    }

    return result;
  }

  get activeFilterCount(): number {
    let n = 0;
    if (this.soloAllegati) n++;
    if (this.searchText.trim()) n++;
    if (this.filterOperatore) n++;
    if (this.dateFrom || this.dateTo) n++;
    return n;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public globalService: GlobalService,
    private location: Location,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.numeroCliente =
      this.route.snapshot.queryParamMap.get('numeroCliente') || '';
    this.nominativo =
      this.route.snapshot.queryParamMap.get('nominativo') || '';
    this.loadNote();
  }

  loadNote() {
    if (!this.numeroCliente) return;
    this.loading = true;
    this.http
      .post<NotaCliente[]>(
        this.globalService.url + 'customers/notes/getAll',
        { numeroCliente: this.numeroCliente },
        { headers: this.globalService.headers },
      )
      .subscribe({
        next: (res) => {
          this.note = Array.isArray(res) ? res : [];
          this.loading = false;
        },
        error: () => {
          this.note = [];
          this.loading = false;
        },
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        this.nuoviAllegati.push({ nome: file.name, base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  removeAllegato(index: number) {
    this.nuoviAllegati.splice(index, 1);
  }

  addNota() {
    if (!this.nuovaNota.trim() && this.nuoviAllegati.length === 0) return;
    this.sending = true;
    const body = {
      numeroCliente: this.numeroCliente,
      operatore: this.globalService.userCode,
      testo: this.nuovaNota.trim(),
      allegati: this.nuoviAllegati,
    };
    this.http
      .post<NotaCliente>(
        this.globalService.url + 'customers/notes/add',
        body,
        { headers: this.globalService.headers },
      )
      .subscribe({
        next: (res) => {
          this.note.push(res);
          this.nuovaNota = '';
          this.nuoviAllegati = [];
          this.sending = false;
        },
        error: () => {
          alert('Errore durante il salvataggio della nota');
          this.sending = false;
        },
      });
  }

  downloadAllegato(allegato: AllegatoNota) {
    const link = document.createElement('a');
    link.href = `data:${allegato.mimeType};base64,${allegato.base64}`;
    link.download = allegato.nome;
    link.click();
  }

  isImage(allegato: AllegatoNota): boolean {
    return (
      allegato.mimeType?.startsWith('image/') ||
      /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(allegato.nome)
    );
  }

  isPdf(allegato: AllegatoNota): boolean {
    return (
      allegato.mimeType === 'application/pdf' ||
      allegato.nome?.toLowerCase().endsWith('.pdf')
    );
  }

  getDataUrl(allegato: AllegatoNota): SafeUrl {
    const mime = allegato.mimeType || 'application/octet-stream';
    return this.sanitizer.bypassSecurityTrustUrl(
      `data:${mime};base64,${allegato.base64}`,
    );
  }

  getPdfResourceUrl(allegato: AllegatoNota): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `data:application/pdf;base64,${allegato.base64}`,
    );
  }

  toggleSoloAllegati() { this.soloAllegati = !this.soloAllegati; }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.searchText = '';
  }

  toggleDateFilter() {
    this.showDateFilter = !this.showDateFilter;
    if (!this.showDateFilter) {
      this.dateFrom = '';
      this.dateTo = '';
      this.filterOperatore = '';
    }
  }

  clearAllFilters() {
    this.soloAllegati = false;
    this.searchText = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.filterOperatore = '';
    this.showSearch = false;
    this.showDateFilter = false;
  }

  private normalize(s: string): string {
    return (s || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }

  private parseDateIT(value: string): Date | null {
    if (!value) return null;
    const [dd, mm, yyyy] = value.split('/');
    if (!dd || !mm || !yyyy) return null;
    return new Date(+yyyy, +mm - 1, +dd);
  }

  back() {
    this.router.navigateByUrl('/listCustomer');
  }

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event): void {
    event.preventDefault();
    this.location.replaceState('/listCustomer');
    this.router.navigateByUrl('/listCustomer');
  }
}
