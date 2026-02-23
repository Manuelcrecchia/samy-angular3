import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-shift-home',
  templateUrl: './shift-home.component.html',
  styleUrl: './shift-home.component.css',
})
export class ShiftHomeComponent {
  selectedDate = new Date();
  shifts: any[] = [];
  groupedByEmployee: {
    [key: string]: {
      empId: number;
      title: string;
      description: string;
      start: string;
      duration: number;
      appointmentId: number;
      sortOrderByEmployee: { [key: number]: number };
      keyRequired: boolean;
      cellulare?: string | null;
      colleghi?: string[];
      published: boolean;
    }[];
  } = {};
  isSaving = false;
  tooltipVisible: boolean = false;
  tooltipText: string = '';
  tooltipTarget: any = null;
  tooltipPosition = { top: 0, left: 0 };
  selectedEmployees: number[] = [];
  selectAll: boolean = false;
  publishedState: { [empId: number]: boolean } = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.loadShifts();
  }
  getEmpId(empName: string): number {
    return this.groupedByEmployee[empName]?.[0]?.empId || 0;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadShifts() {
    const dateStr = this.formatDate(this.selectedDate);
    this.http
      .get<any[]>(`${this.globalService.url}shifts/byDate/${dateStr}`)
      .subscribe((data) => {
        console.log('RAW SHIFTS FROM BACKEND:', data);

        this.groupedByEmployee = this.organizeByEmployee(data);
        this.shifts = data;

        // inizializza stato pubblicazione da backend
        this.publishedState = {};
        for (const empName of this.groupedKeys()) {
          const empId = this.groupedByEmployee[empName][0]?.empId;
          const published =
            this.groupedByEmployee[empName][0]?.published || false;
          if (empId) this.publishedState[empId] = published;
        }

        this.updateSelectAllState();
      });
  }

  groupedKeys(): string[] {
    return Object.keys(this.groupedByEmployee || {}).sort();
  }

  toggleSelectAll() {
    for (const empName of this.groupedKeys()) {
      const empId = this.groupedByEmployee[empName][0]?.empId;
      if (empId) this.publishedState[empId] = this.selectAll;
    }
  }

  updateSelectAllState() {
    const allEmpIds = this.groupedKeys().map(
      (k) => this.groupedByEmployee[k][0]?.empId
    );
    this.selectAll = allEmpIds.every((id) => id && this.publishedState[id]);
  }

  savePublication() {
    // ✅ evita doppio click
    if (this.isSaving) return;

    const dateStr = this.formatDate(this.selectedDate);
    const employees = Object.keys(this.publishedState).map((id) => ({
      id: Number(id),
      published: this.publishedState[Number(id)],
    }));

    this.isSaving = true;

    this.http
      .post(`${this.globalService.url}shifts/publish`, {
        date: dateStr,
        employees,
      })
      .subscribe({
        next: (res: any) => {
          alert(res.message || 'Modifiche salvate correttamente.');
          this.loadShifts();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Errore salvataggio:', err);
          alert('Errore durante il salvataggio delle modifiche.');
          this.isSaving = false;
        },
      });
  }

  getFormattedDate(): string {
    return this.formatDate(this.selectedDate);
  }

  get windowRef() {
    return window;
  }

  handleClick(event: MouseEvent, appointmentId: number) {
    const target = event.target as HTMLElement;
    const date = this.getFormattedDate();

    if (this.tooltipVisible && this.tooltipTarget === target) {
      this.hideTooltip();
    } else {
      this.showPreviousAssignees(appointmentId, date, target);
    }
  }

  organizeByEmployee(shifts: any[]): any {
    const result: { [key: string]: any[] } = {};

    for (const shift of shifts) {
      // 👇 Normalizza sempre sortOrderByEmployee
      let sortMap: any = shift.sortOrderByEmployee;
      if (typeof sortMap === 'string') {
        try {
          sortMap = JSON.parse(sortMap);
        } catch {
          sortMap = {};
        }
      }
      if (!sortMap) sortMap = {};

      const allNames = shift.employees.map(
        (e: any) => `${e.nome} ${e.cognome}`
      );

      for (const emp of shift.employees) {
        const key = `${emp.nome} ${emp.cognome}`;
        if (!result[key]) result[key] = [];

        const colleghi = allNames.filter((name: string) => name !== key);

        result[key].push({
          empId: emp.id,
          title: shift.appointment?.title || shift.title,
          description: shift.description,
          start:
            shift.startDate &&
            shift.startDate !== 'null' &&
            shift.startDate !== ''
              ? shift.startDate
              : null,
          // ✅ durata per dipendente: se presente durationOverride sul join, usa quella
          duration:
            emp?.ShiftEmployees?.durationOverride != null
              ? Number(emp.ShiftEmployees.durationOverride) || 0
              : Number(shift.duration) || 0,
          appointmentId: shift.appointmentId,
          keyRequired: shift.appointment?.customer?.key === true,
          cellulare: emp.cellulare || null,
          colleghi: colleghi,
          sortOrderByEmployee: sortMap,
          published: shift.published || false,
        });
      }
    }

    // 👇 Ordina i turni di ogni dipendente
    for (const k in result) {
      const empId = result[k][0]?.empId;

      result[k].sort((a, b) => {
        const sa = empId != null ? a.sortOrderByEmployee?.[empId] : undefined;
        const sb = empId != null ? b.sortOrderByEmployee?.[empId] : undefined;

        if (sa != null && sb != null) return sa - sb;
        if (sa != null) return -1;
        if (sb != null) return 1;

        if (a.start && b.start)
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        if (a.start && !b.start) return -1;
        if (!a.start && b.start) return 1;

        return 0;
      });
    }

    return result;
  }

  prevDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    this.selectedDate = newDate;
    this.loadShifts();
  }

  nextDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    this.selectedDate = newDate;
    this.loadShifts();
  }

  createShifts(): void {
    this.router.navigate(['/admin/shifts/create'], {
      queryParams: { date: this.formatDate(this.selectedDate) },
    });
  }

  showPreviousAssignees(
    appointmentId: number,
    date: string,
    target: HTMLElement
  ) {
    this.tooltipVisible = true;
    this.tooltipText = 'Caricamento...';
    this.tooltipTarget = target;

    const rect = target.getBoundingClientRect();
    const tooltipWidth = 200; // stima larghezza del tooltip
    const tooltipHeight = 40; // stima altezza

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 5;

    // 👉 Se tooltip esce a destra, spostalo a sinistra
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    // 👉 Se tooltip esce in basso, spostalo sopra
    if (top + tooltipHeight > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - tooltipHeight - 5;
    }

    this.tooltipPosition = { top, left };

    this.http
      .post<any[]>(this.globalService.url + 'shifts/getPreviousAssignees', {
        appointmentId: appointmentId,
        currentDate: date,
      })
      .subscribe(
        (employees) => {
          if (employees.length === 0) {
            this.tooltipText = 'Nessun assegnato precedente';
          } else {
            this.tooltipText = employees
              .map((e) => `${e.nome} ${e.cognome}`)
              .join(', ');
          }
        },
        (err) => {
          this.tooltipText = 'Errore nel recupero';
        }
      );
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '0 minuti';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h > 0 && m > 0) {
      return `${h} ${h === 1 ? 'ora' : 'ore'} e ${m} minuti`;
    } else if (h > 0) {
      return `${h} ${h === 1 ? 'ora' : 'ore'}`;
    } else {
      return `${m} minuti`;
    }
  }

  sendViaWhatsApp(empName: string): void {
    const dateStr = this.getFormattedDate();

    // Trovo un numero cellulare dal primo turno di quel dipendente
    const numeroGrezzo = this.groupedByEmployee[empName]?.[0]?.cellulare;
    if (!numeroGrezzo) {
      alert('Nessun numero di telefono trovato per questo dipendente');
      return;
    }
    const safeName = empName.trim().replace(/\s+/g, ' ');

    // Richiesta al backend per ottenere il link sicuro
    this.http
      .get<{ url: string }>(
        `${
          this.globalService.url
        }shifts/pdf-link?date=${dateStr}&empName=${encodeURIComponent(empName)}`
      )
      .subscribe(
        (res) => {
          const pdfLink = res.url;

          // Pulizia numero → solo cifre
          const numeroPulito = numeroGrezzo.replace(/\D/g, '');
          const numeroConPrefisso = '39' + numeroPulito;

          // Messaggio WhatsApp
          const msg =
            `Ciao ${empName}, ecco i tuoi turni di oggi 📄\n\n` +
            `Scarica qui il PDF:\n${pdfLink}`;

          const encoded = encodeURIComponent(msg);

          // Apertura WhatsApp
          window.location.href = `whatsapp://send?phone=${numeroConPrefisso}&text=${encoded}`;
        },
        (err) => {
          console.error('Errore recuperando link PDF:', err);
          alert('Errore nel recupero del link PDF');
        }
      );
  }

  formatHour(date: string | Date | null): string {
    if (!date) return ''; // 👈 se è null/undefined/stringa vuota → ritorna vuoto

    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return ''; // 👈 se non è data valida
    return d.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  hideTooltip() {
    this.tooltipVisible = false;
    this.tooltipText = '';
    this.tooltipTarget = null;
  }

  back() {
    this.router.navigate(['/homeAdmin']);
  }
}
