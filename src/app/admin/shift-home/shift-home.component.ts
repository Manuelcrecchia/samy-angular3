import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { TenantService } from '../../service/tenant.service';

interface ShiftRow {
  empId: number;
  title: string;
  description: string;
  start: string | null;
  duration: number;
  appointmentId: number;
  keyRequired: boolean;
  cellulare?: string | null;
  colleghi?: string[];
  published: boolean;
  vehicleName?: string | null;
  vehiclePlate?: string | null;
}

@Component({
  selector: 'app-shift-home',
  templateUrl: './shift-home.component.html',
  styleUrl: './shift-home.component.css',
})
export class ShiftHomeComponent implements OnInit {
  selectedDate: Date = new Date();

  shifts: any[] = [];
  groupedByEmployee: { [key: string]: ShiftRow[] } = {};

  selectedEmployees: number[] = [];
  selectAll: boolean = false;
  isSaving: boolean = false;

  tooltipVisible: boolean = false;
  tooltipText: string = '';
  tooltipPosition = { top: 0, left: 0 };
  tooltipTarget: HTMLElement | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private globalService: GlobalService,
    public tenantService: TenantService,
  ) {}

  ngOnInit(): void {
    this.loadShifts();
  }

  groupedKeys(): string[] {
    return Object.keys(this.groupedByEmployee || {}).sort();
  }

  getEmpId(empName: string): number {
    return this.groupedByEmployee[empName]?.[0]?.empId ?? 0;
  }

  private isEmployeePublished(empId: number): boolean {
    if (!empId) return false;

    const rows = Object.values(this.groupedByEmployee || {})
      .flat()
      .filter((r) => r.empId === empId);

    if (rows.length === 0) return false;

    return rows.every((r) => r.published === true);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private resolveKeyRequired(shift: any): boolean {
    if (!this.tenantService.isSami) return false;

    return (
      shift?.keyRequired === true ||
      shift?.appointment?.keyRequired === true ||
      shift?.appointment?.customer?.key === true
    );
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '0 minuti';

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h > 0 && m > 0) {
      return `${h} ${h === 1 ? 'ora' : 'ore'} e ${m} minuti`;
    }

    if (h > 0) {
      return `${h} ${h === 1 ? 'ora' : 'ore'}`;
    }

    return `${m} minuti`;
  }

  loadShifts(): void {
    const dateStr = this.formatDate(this.selectedDate);

    this.http
      .get<any[]>(`${this.globalService.url}shifts/byDate/${dateStr}`)
      .subscribe({
        next: (data: any[]) => {
          const shiftsArray = Array.isArray(data) ? data : [];

          this.shifts = shiftsArray;
          this.groupedByEmployee = this.organizeByEmployee(shiftsArray);

          const allIds = this.groupedKeys()
            .map((name) => this.getEmpId(name))
            .filter((id) => id > 0);

          this.selectedEmployees = allIds.filter((id) =>
            this.isEmployeePublished(id),
          );

          this.updateSelectAllState();
        },
        error: (err) => {
          console.error('Errore caricamento turni:', err);
          alert('Errore nel caricamento dei turni');
        },
      });
  }

  private organizeByEmployee(shifts: any[]): { [key: string]: ShiftRow[] } {
    const result: { [key: string]: ShiftRow[] } = {};

    for (const shift of shifts) {
      const employees = Array.isArray(shift.employees) ? shift.employees : [];

      const allNames: string[] = employees.map((e: any) =>
        `${e?.nome ?? ''} ${e?.cognome ?? ''}`.trim(),
      );

      for (const emp of employees) {
        const key: string = `${emp?.nome ?? ''} ${emp?.cognome ?? ''}`.trim();
        if (!result[key]) result[key] = [];

        const colleghi: string[] = allNames.filter(
          (name: string) => name !== key,
        );

        const joinPublished: boolean = emp?.ShiftEmployees?.published === true;

        result[key].push({
          empId: Number(emp?.id) || 0,
          title: shift?.appointment?.title || shift?.title || '-',
          description: shift?.description || '',
          start:
            shift?.startDate &&
            shift?.startDate !== 'null' &&
            shift?.startDate !== ''
              ? shift.startDate
              : null,
          duration:
            emp?.ShiftEmployees?.durationOverride != null
              ? Number(emp.ShiftEmployees.durationOverride) || 0
              : Number(shift?.duration) || 0,
          appointmentId: Number(shift?.appointmentId) || 0,
          keyRequired: this.resolveKeyRequired(shift),
          cellulare: emp?.cellulare ?? null,
          colleghi,
          published: joinPublished,
          vehicleName: shift?.vehicle?.name ?? null,
          vehiclePlate: shift?.vehicle?.plate ?? null,
        });
      }
    }

    return result;
  }

  toggleEmployeeSelection(empId: number): void {
    if (!empId) return;

    const index = this.selectedEmployees.indexOf(empId);

    if (index >= 0) {
      this.selectedEmployees.splice(index, 1);
    } else {
      this.selectedEmployees.push(empId);
    }

    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    const allIds = this.groupedKeys()
      .map((name) => this.getEmpId(name))
      .filter((id) => id > 0);

    if (this.selectAll) {
      this.selectedEmployees = [...allIds];
    } else {
      this.selectedEmployees = [];
    }
  }

  private updateSelectAllState(): void {
    const allIds = this.groupedKeys()
      .map((name) => this.getEmpId(name))
      .filter((id) => id > 0);

    this.selectAll =
      allIds.length > 0 &&
      allIds.every((id) => this.selectedEmployees.includes(id));
  }

  savePublication(): void {
    if (this.isSaving) return;

    const dateStr = this.formatDate(this.selectedDate);

    const allIds = this.groupedKeys()
      .map((name) => this.getEmpId(name))
      .filter((id) => id > 0);

    if (allIds.length === 0) {
      alert('Nessun dipendente presente per questa data.');
      return;
    }

    const employees = allIds.map((id) => ({
      id,
      published: this.selectedEmployees.includes(id),
    }));

    this.isSaving = true;

    this.http
      .post(`${this.globalService.url}shifts/publish`, {
        date: dateStr,
        employees,
      })
      .subscribe({
        next: (res: any) => {
          this.isSaving = false;
          this.loadShifts();
          if (res?.message) alert(res.message);
        },
        error: (err) => {
          console.error('Errore pubblicazione:', err);
          this.isSaving = false;
          alert('Errore durante la pubblicazione.');
        },
      });
  }

  prevDay(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() - 1);
    this.selectedDate = d;
    this.loadShifts();
  }

  nextDay(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + 1);
    this.selectedDate = d;
    this.loadShifts();
  }

  createShifts(): void {
    this.router.navigate(['/admin/shifts/create'], {
      queryParams: { date: this.formatDate(this.selectedDate) },
    });
  }

  back(): void {
    this.router.navigate(['/homeAdmin']);
  }

  handleClick(event: MouseEvent, appointmentId: number): void {
    if (!this.tenantService.isSami) return;

    const target = event.target as HTMLElement;
    const dateStr = this.formatDate(this.selectedDate);

    if (this.tooltipVisible && this.tooltipTarget === target) {
      this.hideTooltip();
      return;
    }

    this.showPreviousAssignees(appointmentId, dateStr, target);
  }

  private showPreviousAssignees(
    appointmentId: number,
    dateStr: string,
    target: HTMLElement,
  ): void {
    this.tooltipVisible = true;
    this.tooltipText = 'Caricamento...';
    this.tooltipTarget = target;

    const rect = target.getBoundingClientRect();
    const tooltipWidth = 260;
    const tooltipHeight = 44;

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 8;

    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 12;
    }

    if (top + tooltipHeight > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - tooltipHeight - 8;
    }

    this.tooltipPosition = { top, left };

    this.http
      .post<any[]>(`${this.globalService.url}shifts/getPreviousAssignees`, {
        appointmentId,
        currentDate: dateStr,
      })
      .subscribe({
        next: (employees: any[]) => {
          if (!Array.isArray(employees) || employees.length === 0) {
            this.tooltipText = 'Nessun assegnato precedente';
            return;
          }

          this.tooltipText = employees
            .map((e: any) => `${e?.nome ?? ''} ${e?.cognome ?? ''}`.trim())
            .filter((name: string) => !!name)
            .join(', ');
        },
        error: () => {
          this.tooltipText = 'Errore nel recupero';
        },
      });
  }

  private hideTooltip(): void {
    this.tooltipVisible = false;
    this.tooltipText = '';
    this.tooltipTarget = null;
  }

  sendViaWhatsApp(empName: string): void {
    const dateStr = this.formatDate(this.selectedDate);

    const phoneRaw = this.groupedByEmployee[empName]?.[0]?.cellulare ?? null;

    if (!phoneRaw) {
      alert('Nessun numero di telefono trovato per questo dipendente');
      return;
    }

    this.http
      .get<{
        url: string;
      }>(
        `${this.globalService.url}shifts/pdf-link?date=${dateStr}&empName=${encodeURIComponent(empName)}`,
      )
      .subscribe({
        next: (res) => {
          const pdfLink = res?.url;

          if (!pdfLink) {
            alert('Link PDF non disponibile');
            return;
          }

          const phoneDigits = String(phoneRaw).replace(/\D/g, '');

          if (!phoneDigits) {
            alert('Numero di telefono non valido');
            return;
          }

          const phoneWithPrefix = phoneDigits.startsWith('39')
            ? phoneDigits
            : `39${phoneDigits}`;

          const message =
            `Ciao ${empName}, ecco i tuoi turni 📄\n\n` +
            `Scarica qui il PDF:\n${pdfLink}`;

          const encoded = encodeURIComponent(message);

          window.location.href = `https://wa.me/${phoneWithPrefix}?text=${encoded}`;
        },
        error: () => {
          alert('Errore nel recupero del link PDF');
        },
      });
  }
}
