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
      title: string;
      description: string;
      start: string;
      end: string;
      appointmentId: number;
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
      const allNames = shift.employees.map(
        (e: any) => `${e.nome} ${e.cognome}`
      );
      for (const emp of shift.employees) {
        const key = `${emp.nome} ${emp.cognome}`;
        if (!result[key]) result[key] = [];

        const colleghi = allNames.filter((name: string) => name !== key);

        result[key].push({
          title: shift.appointment?.title || shift.title,
          description: shift.appointment?.description || shift.description,
          start: shift.appointment?.startDate || shift.startDate,
          end: shift.appointment?.endDate || shift.endDate,
          appointmentId: shift.appointmentId,
          keyRequired: shift.appointment?.customer?.key === true,
          cellulare: emp.cellulare || null,
          colleghi: colleghi,
        });
        
      }
    }

    for (const k in result) {
      result[k].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );
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

  sendViaWhatsApp(empName: string): void {
    const turni = this.groupedByEmployee[empName];
    const dayStr = this.selectedDate
      .toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      .toUpperCase();
  
    // intestazione messaggio
    let testo = `${empName.toUpperCase()} – ${dayStr}\n\n`;
  
    for (const turno of turni) {
      // riga orario + titolo
      testo += `${turno.title} — ${this.formatHour(turno.start)} - ${this.formatHour(turno.end)}${turno.keyRequired ? ' 🔑' : ''}\n`;
  
      // riga descrizione (se presente)
      if (turno.description) {
        testo += `${turno.description}\n`;
      }
  
      // riga colleghi o "Da solo"
      if (turno.colleghi && turno.colleghi.length > 0) {
        testo += `👥 Con: ${turno.colleghi.join(', ')}\n\n`;
      } else {
        testo += `👤 Da solo\n\n`;
      }
    }
  
    const numeroGrezzo = turni.find((t) => t.cellulare)?.cellulare;
    const encodedMsg = encodeURIComponent(testo);
  
    // default: solo testo
    let url = 'whatsapp://send?text=' + encodedMsg;
  
    if (numeroGrezzo) {
      const numeroPulito = numeroGrezzo.replace(/\D/g, '');
      const numeroConPrefisso = '39' + numeroPulito;
      url = `whatsapp://send?phone=${numeroConPrefisso}&text=${encodedMsg}`;
    }
  
    window.location.href = url;
  }
  

  formatHour(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
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
