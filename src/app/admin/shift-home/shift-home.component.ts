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
    }[];
  } = {};
  tooltipVisible: boolean = false;
  tooltipText: string = '';
  tooltipTarget: any = null;
  tooltipPosition = { top: 0, left: 0 };

  groupedKeys(): string[] {
    return Object.keys(this.groupedByEmployee || {}).sort();
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.loadShifts();
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

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
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
          duration: Number(shift.duration) || 0,
          appointmentId: shift.appointmentId,
          keyRequired: shift.appointment?.customer?.key === true,
          cellulare: emp.cellulare || null,
          colleghi: colleghi,
          sortOrderByEmployee: sortMap,
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

  loadShifts() {
    const dateStr = this.formatDate(this.selectedDate);
    this.http
      .get<any[]>(this.globalService.url + `shifts/byDate/${dateStr}`)
      .subscribe((data) => {
        this.groupedByEmployee = this.organizeByEmployee(data);
        this.shifts = data;
      });
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
    // ✅ ordino i turni con la stessa logica di organizeByEmployee
    const turni = [...this.groupedByEmployee[empName]].sort((a, b) => {
      const empId = a.empId; // tutti i turni qui hanno lo stesso empId

      // 👇 Normalizza se serve
      let sa = a.sortOrderByEmployee?.[empId];
      let sb = b.sortOrderByEmployee?.[empId];

      if (typeof sa === 'string') sa = parseInt(sa, 10);
      if (typeof sb === 'string') sb = parseInt(sb, 10);

      if (sa != null && sb != null) return sa - sb;
      if (sa != null) return -1;
      if (sb != null) return 1;

      if (a.start && b.start) {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      }
      if (a.start && !b.start) return -1;
      if (!a.start && b.start) return 1;

      return 0;
    });

    const dayStr = this.selectedDate
      .toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      .toUpperCase();

    let testo = `${empName.toUpperCase()} – ${dayStr}\n\n`;

    for (const turno of turni) {
      const startStr = turno.start ? this.formatHour(turno.start) : '';
      const durataStr = this.formatDuration(turno.duration);
      const cleanTitle = turno.title
        ? turno.title.replace(/^\d+\s*-\s*/, '')
        : '';

      testo += `• ${cleanTitle}`;
      if (startStr) testo += ` — ${startStr}`;
      testo += ` • ${durataStr}`;

      if (turno.keyRequired) {
        testo += ' 🔑';
      }
      testo += `\n`;

      if (turno.description) {
        testo += `  ${turno.description}\n`;
      }

      if (turno.colleghi && turno.colleghi.length > 0) {
        testo += `  👥 Con: ${turno.colleghi.join(', ')}\n\n`;
      } else {
        testo += `  👤 Da solo\n\n`;
      }
    }

    const numeroGrezzo = turni.find((t) => t.cellulare)?.cellulare;
    const encodedMsg = encodeURIComponent(testo);

    let url = 'whatsapp://send?text=' + encodedMsg;
    if (numeroGrezzo) {
      const numeroPulito = numeroGrezzo.replace(/\D/g, '');
      const numeroConPrefisso = '39' + numeroPulito;
      url = `whatsapp://send?phone=${numeroConPrefisso}&text=${encodedMsg}`;
    }

    window.location.href = url;
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
