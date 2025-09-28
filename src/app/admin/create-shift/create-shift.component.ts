import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AssignDialogComponent } from '../assign-dialog/assign-dialog.component';
import { GlobalService } from '../../service/global.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-create-shift',
  templateUrl: './create-shift.component.html',
  styleUrls: ['./create-shift.component.css'],
})
export class CreateShiftComponent implements OnInit {
  selectedDate: Date = new Date();
  appointments: any[] = [];
  assignedShifts: { [appointmentId: string]: number[] } = {};
  loading = false;
  employeeList: any[] = [];
  previousWeekShiftList: { cliente: string; dipendenti: string[] }[] = [];
  durationOptions: number[] = Array.from({ length: 33 }, (_, i) => i * 15); // 0 → 480 minuti

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    const queryDate = this.route.snapshot.queryParamMap.get('date');
    if (queryDate) this.selectedDate = new Date(queryDate);

    this.loadAppointments();

    this.http
      .get<any[]>(this.globalService.url + 'employees/getAll')
      .subscribe((res) => (this.employeeList = res));

    this.showPreviousWeekShifts();
  }

  // 🔹 Incrementa/decrementa di 15 minuti
  changeDuration(app: any, delta: number) {
    this.applyDuration(app);

    if (!app.duration) app.duration = 0;
    app.duration = Math.max(0, Math.min(480, app.duration + delta));
    app.durationDisplay = this.formatDuration(app.duration);
  }

  // 🔹 Quando si esce dal campo, converte testo in minuti
  applyDuration(app: any) {
    if (!app.durationDisplay) {
      app.duration = 0;
      app.durationDisplay = '00.00';
      return;
    }

    const parts = app.durationDisplay.split('.');
    if (parts.length === 2) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      app.duration = h * 60 + m;
    } else {
      app.duration = parseInt(app.durationDisplay, 10) || 0;
    }

    app.duration = Math.max(0, Math.min(480, app.duration)); // clamp
    app.durationDisplay = this.formatDuration(app.duration);
  }

  // 🔹 Formatta minuti → hh.mm
  formatDuration(minutes: number): string {
    if (!minutes) return '00.00';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}.${m.toString().padStart(2, '0')}`;
  }

  loadExistingShifts(): void {
    const dateStr = this.formatDate(this.selectedDate);
  
    this.http
      .get<any[]>(this.globalService.url + `shifts/byDate/${dateStr}`)
      .subscribe((existing) => {
        for (const s of existing) {
          // 🟡 Caso 1: turno extra
          if (!s.appointmentId) {
            const extraId = `extra-${s.id}`;
  
            if (!this.appointments.some((a) => a.id === extraId)) {
              this.appointments.push({
                id: extraId,
                appointmentId: null,
                isExtra: true,
                title: s.title,
                description: s.description,
                startDate: (s.startDate && s.startDate !== 'null' && s.startDate !== '')
                  ? new Date(s.startDate)
                  : null,
                duration: s.duration ?? 60,
                durationDisplay: this.formatDuration(s.duration ?? 60),
                requiredEmployees: 0,
                sortOrderByEmployee: s.sortOrderByEmployee || {}   // 👈 sempre inizializzato
              });
            }
  
            this.assignedShifts[extraId] = (s.employees || []).map((e: any) => e.id);
          }
  
          // 🟢 Caso 2: turno normale (appointment esistente)
          else {
            const app = this.appointments.find(
              (a) =>
                a.id === s.appointmentId ||
                a.originalAppointmentId === s.appointmentId
            );
  
            if (app) {
              if ('startDate' in s) {
                app.startDate = (s.startDate && s.startDate !== 'null' && s.startDate !== '')
                  ? new Date(s.startDate)
                  : null;
              }
  
              if (typeof s.duration === 'number') {
                app.duration = s.duration;
                app.durationDisplay = this.formatDuration(s.duration);
              }
  
              if (s.description !== undefined) {
                app.description = s.description ?? '';
              }
  
              app.sortOrderByEmployee = s.sortOrderByEmployee || {};  // 👈 sempre inizializzato
  
              this.assignedShifts[app.id] = (s.employees || []).map((e: any) => e.id);
            }
          }
        }
  
        this.sortAppointments();
      });
  }
  

  // 🔹 Utility
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getEmployeeName(id: number): string {
    const found = this.employeeList.find((e) => e.id === id);
    return found ? `${found.nome} ${found.cognome}` : `ID ${id}`;
  }

  // 🔹 Caricamento appuntamenti
  loadAppointments(): void {
    this.loading = true;
    const dateStr = this.formatDate(this.selectedDate);
  
    this.appointments = [];
  
    this.http
      .post<any[]>(this.globalService.url + 'appointments/byDate', { date: dateStr })
      .subscribe((data) => {
        let counter = 100000;
  
        this.appointments = data
          .map((a) =>
            a.isRecurringInstance
              ? {
                  ...a,
                  id: counter++,
                  originalAppointmentId: a.id,
                  description: a.description || '',
                }
              : { ...a }
          )
          .filter(
            (a) => a.categories === 'ordinario' || a.categories === 'straordinario'
          )
          .map((a) => {
            // 👇 Conversione startDate
            if (a.startDate && a.startDate !== 'null' && a.startDate !== '') {
              a.startDate = new Date(a.startDate);
            } else {
              a.startDate = null;
            }
          
            // 👇 Conversione endDate e calcolo durata automatica
            if (a.endDate && a.endDate !== 'null' && a.endDate !== '') {
              a.endDate = new Date(a.endDate);
          
              if (a.startDate && a.endDate) {
                const diffMinutes = Math.floor(
                  (a.endDate.getTime() - a.startDate.getTime()) / 60000
                );
                a.duration = diffMinutes > 0 ? diffMinutes : 0;
              }
            }
          
            // 👇 fallback se non è un numero
            if (typeof a.duration !== 'number') {
              a.duration = 0;
            }
          
            a.durationDisplay = this.formatDuration(a.duration);
            a.sortOrderByEmployee = a.sortOrderByEmployee || {};
          
            return a;
          });
          
  
        this.sortAppointments();
        this.loading = false;
        this.loadExistingShifts();
      });
  }
  
  
  private sortAppointments(): void {
    const baseDate = new Date(this.selectedDate);
  
    const normalize = (val: any): Date | null => {
      if (val instanceof Date) return val;
      if (typeof val === 'string') {
        if (/^\d{1,2}:\d{2}$/.test(val)) {
          const [h, m] = val.split(':').map(Number);
          const d = new Date(baseDate);
          d.setHours(h, m, 0, 0);
          return d;
        }
        const d = new Date(val.includes(' ') && !val.includes('T') ? val.replace(' ', 'T') : val);
        return isNaN(d.getTime()) ? null : d;
      }
      if (typeof val === 'number') return new Date(val);
      return null;
    };
  
    for (const a of this.appointments) {
      a.startDate = a.startDate != null ? (normalize(a.startDate) ?? null) : null;
      if (typeof a.duration !== 'number') a.duration = 0;
      a.durationDisplay = this.formatDuration(a.duration);
    }
  
    this.appointments.sort((a, b) => {
      // 1️⃣ sortOrderByEmployee (se definito)
      const empId = null; // qui puoi passare l'id se sei nel contesto dipendente
      const orderA = empId != null ? a.sortOrderByEmployee?.[empId] : undefined;
      const orderB = empId != null ? b.sortOrderByEmployee?.[empId] : undefined;
      if (orderA != null && orderB != null) return orderA - orderB;
      if (orderA != null) return -1;
      if (orderB != null) return 1;
  
      // 3️⃣ fallback → orario (null resta in mezzo, non sostituito)
      if (a.startDate && b.startDate) return a.startDate.getTime() - b.startDate.getTime();
      if (a.startDate && !b.startDate) return -1;
      if (!a.startDate && b.startDate) return 1;
      return 0;
    });
  }
  

  dropGeneral(event: CdkDragDrop<any[]>): void {
  moveItemInArray(this.appointments, event.previousIndex, event.currentIndex);

  // forza Angular a ricalcolare il binding
  this.appointments = [...this.appointments];
}


  // 🔹 Turni della settimana precedente
  showPreviousWeekShifts(): void {
    const prevDate = new Date(this.selectedDate);
    prevDate.setDate(prevDate.getDate() - 7);
    const dateStr = this.formatDate(prevDate);

    this.http
      .get<any[]>(this.globalService.url + `shifts/byDate/${dateStr}`)
      .subscribe((data) => {
        const mappa: { [cliente: string]: string[] } = {};

        for (const s of data) {
          // titolo: per i normali prendo dall'appointment, per gli extra dal shift
          const title = s.appointment?.title || s.title || '---';

          const fullNames =
            s.employees?.map((e: any) => `${e.nome} ${e.cognome}`) || [];

          if (!mappa[title]) mappa[title] = [];
          mappa[title].push(...fullNames);
        }

        this.previousWeekShiftList = Object.entries(mappa).map(
          ([cliente, dipendenti]) => ({ cliente, dipendenti })
        );
      });
  }

  // 🔹 Navigazione
  prevDay(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() - 1);
    this.selectedDate = d;
    this.loadAppointments();
    this.showPreviousWeekShifts();
  }

  nextDay(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + 1);
    this.selectedDate = d;
    this.loadAppointments();
    this.showPreviousWeekShifts();
  }

  // 🔹 Lavori extra
  addExtra(): void {
    const newId = 'extra-' + Date.now();
    const start = new Date(this.selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60000);

    this.appointments.push({
      id: newId,
      appointmentId: null,
      isExtra: true,
      title: 'Nuovo lavoro extra',
      description: '',
      startDate: start,
      duration: 0,
      durationDisplay: this.formatDuration(0),
      requiredEmployees: 0,
    });

    this.sortAppointments();
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  removeExtra(app: any): void {
    const dateStr = this.formatDate(this.selectedDate);

    const payload: any = {
      appointmentId: app.appointmentId,
      data: dateStr,
    };

    if (app.isExtra && app.id.startsWith('extra-')) {
      const numericId = Number(app.id.replace('extra-', ''));
      if (!isNaN(numericId)) {
        payload.shiftId = numericId;
      }
    }

    this.http
      .post(this.globalService.url + 'shifts/delete', payload)
      .subscribe(() => {
        this.appointments = this.appointments.filter((a) => a.id !== app.id);
      });
  }

  // 👇 Ritorna stringa HH:mm oppure '' se non impostato
  getShiftTime(app: any): string {
    if (!app.startDate) return '';
    const d = new Date(app.startDate);
    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  
  onTimeTextChange(app: any, value: string) {
    const d = this.parseHourInput(value);
    app.startDate = d; // Date o null
  }

  getEmployeeTotalDuration(empId: number): string {
    const jobs = this.getEmployeeShifts(empId);
    const totalMinutes = jobs.reduce((sum, job) => sum + (job.duration || 0), 0);
    return this.formatDuration(totalMinutes);
  }
    

  // 👇 Se value è stringa vuota → salva null
  updateTime(app: any, value: string) {
    if (!value) {
      app.startDate = null; 
      return;
    }
    const [h, m] = value.split(':').map(Number);
    const d = new Date(this.selectedDate);
    d.setHours(h, m, 0, 0);
    app.startDate = d;
  }

  parseHourInput(value: string): Date | null {
    if (!value) return null;

    const clean = value.replace(/\D/g, '');
    const d = new Date(this.selectedDate);

    if (clean.length === 4) {
      const h = parseInt(clean.slice(0, 2), 10);
      const m = parseInt(clean.slice(2, 4), 10);
      d.setHours(h, m, 0, 0);
      return d;
    }

    if (clean.length === 2) {
      const h = parseInt(clean, 10);
      d.setHours(h, 0, 0, 0);
      return d;
    }

    if (value.includes(':')) {
      const [h, m] = value.split(':').map((v) => parseInt(v, 10));
      d.setHours(h, m, 0, 0);
      return d;
    }

    return null;
  }

  // 🔹 Dialog dipendenti
  openAssignmentDialog(app: any): void {
    const dialogRef = this.dialog.open(AssignDialogComponent, {
      width: '500px',
      data: {
        ...app,
        assigned: this.assignedShifts[app.id] || [],
        busyDetails: this.getBusyDetails(app),
        requiredEmployees: app.requiredEmployees,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.assignedShifts[app.id] = result.employees || result;
        if (result.forceConfirmed) {
          app.forceConfirmed = true;
        }
      }
    });
  }

  getBusyDetails(currentApp: any): any[] {
    const conflicts: any[] = [];
    const currentStart = new Date(currentApp.startDate).getTime();
    const currentEnd = currentStart + (currentApp.duration || 60) * 60000;

    for (const a of this.appointments) {
      if (a.id === currentApp.id) continue;
      const start = new Date(a.startDate).getTime();
      const end = start + (a.duration || 60) * 60000;

      if (currentStart < end && currentEnd > start) {
        const empIds = this.assignedShifts[a.id] || [];
        empIds.forEach((empId) => {
          conflicts.push({
            employeeId: empId,
            title: a.title,
            start: this.getShiftTime(a),
            duration: a.duration || 60,
          });
        });
      }
    }
    return conflicts;
  }

  getBusyEmployees(currentApp: any): number[] {
    const busy: number[] = [];
    const currentStart = new Date(currentApp.startDate).getTime();
    const currentEnd = currentStart + (currentApp.duration || 0) * 60000;

    for (const a of this.appointments) {
      if (a.id === currentApp.id) continue;
      const start = new Date(a.startDate).getTime();
      const end = start + (a.duration || 0) * 60000;
      if (currentStart < end && currentEnd > start) {
        busy.push(...(this.assignedShifts[a.id] || []));
      }
    }
    return busy;
  }

  private toSqlDateTime(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  getEmployeeShifts(empId: number): any[] {
    const jobs = this.appointments.filter(app =>
      (this.assignedShifts[app.id] || []).includes(empId)
    );
  
    return jobs.sort((a, b) => {
      const sa = a.sortOrderByEmployee?.[empId];
      const sb = b.sortOrderByEmployee?.[empId];
  
      if (sa != null && sb != null) return sa - sb;
      if (sa != null) return -1;
      if (sb != null) return 1;
  
      if (a.startDate && b.startDate) return a.startDate.getTime() - b.startDate.getTime();
      if (a.startDate && !b.startDate) return -1;
      if (!a.startDate && b.startDate) return 1;
  
      return 0;
    });
  }
  
  
  
  
  

  dropForEmployee(event: CdkDragDrop<any[]>, empId: number) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  
    event.container.data.forEach((job, i) => {
      if (!job.sortOrderByEmployee) job.sortOrderByEmployee = {};
      job.sortOrderByEmployee[empId] = i;
    });
  
    // 👇 forza Angular a ricalcolare il binding
    this.employeeList = [...this.employeeList];
  }
  
  

  // 🔹 Salvataggio
  finalSave(): void {
    const dateStr = this.formatDate(this.selectedDate);

    const payload = this.appointments.map((app) => {
      // 👇 Gestione startDate: se nullo/"" rimane null
      let start: string | null = null;

      if (app.startDate instanceof Date && !isNaN(app.startDate.getTime())) {
        start = this.toSqlDateTime(app.startDate);
      } else if (
        typeof app.startDate === 'string' &&
        app.startDate.trim() !== ''
      ) {
        const d = new Date(app.startDate);
        if (!isNaN(d.getTime())) {
          start = this.toSqlDateTime(d);
        }
      }

      if (app.isExtra || String(app.id).startsWith('extra-')) {
        const isPersisted =
          app.id.startsWith('extra-') &&
          !isNaN(Number(app.id.replace('extra-', '')));

        return {
          shiftId: isPersisted ? Number(app.id.replace('extra-', '')) : null,
          appointmentId: null,
          data: dateStr,
          employeeIds: this.assignedShifts[app.id] || [],
          title: app.title,
          description: app.description,
          startDate: start, // 👈 se non impostato → null
          duration: app.duration || 60,
          sortOrderByEmployee: app.sortOrderByEmployee || {},
        };
      } else {
        return {
          shiftId: app.shiftId || null,
          appointmentId: app.originalAppointmentId || app.id,
          data: dateStr,
          employeeIds: this.assignedShifts[app.id] || [],
          startDate: start, // 👈 se non impostato → null
          duration: app.duration || 60,
          description: app.description || '',
          sortOrderByEmployee: app.sortOrderByEmployee || {},
        };
      }
    });

    this.http
      .post(this.globalService.url + 'shifts/saveMultiple', { shifts: payload })
      .subscribe(() => {
        alert('Turni salvati');
        this.router.navigate(['/admin/shifts']);
      });
  }

  isComplete(app: any): boolean {
    if (app.forceConfirmed) return true;
    const assigned = this.assignedShifts[app.id] || [];
    return assigned.length >= (app.requiredEmployees || 1);
  }

  goBack(): void {
    this.router.navigate(['/admin/shifts']);
  }
}
