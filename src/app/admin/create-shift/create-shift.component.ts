import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AssignDialogComponent } from '../assign-dialog/assign-dialog.component';
import { GlobalService } from '../../service/global.service';

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

  loadExistingShifts(): void {
    const dateStr = this.formatDate(this.selectedDate);

    this.http
      .get<any[]>(this.globalService.url + `shifts/byDate/${dateStr}`)
      .subscribe((existing) => {
        for (const s of existing) {
          // 🔹 Caso 1: turno extra (appointmentId nullo + categories = 'extra')
          if (!s.appointmentId && s.appointment?.categories === 'extra') {
            const extraId = `extra-${s.id}`;

            this.appointments.push({
              id: extraId,
              appointmentId: null,
              isExtra: true,
              title: s.appointment.title || s.title,
              description: s.appointment.description || s.description,
              startDate: new Date(s.appointment.startDate || s.startDate),
              endDate: new Date(s.appointment.endDate || s.endDate),
              requiredEmployees: 0,
            });

            this.assignedShifts[extraId] = (s.employees || []).map(
              (e: any) => e.id
            );
          }

          // 🔹 Caso 2: turno normale (collegato a un appointment)
          else {
            const app = this.appointments.find(
              (a) =>
                a.id === s.appointmentId ||
                a.originalAppointmentId === s.appointmentId
            );

            if (app) {
              // override orari se salvati
              if (s.startDate) app.startDate = new Date(s.startDate);
              if (s.endDate) app.endDate = new Date(s.endDate);

              this.assignedShifts[app.id] = (s.employees || []).map(
                (e: any) => e.id
              );
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

    this.http
      .post<any[]>(this.globalService.url + 'appointments/byDate', {
        date: dateStr,
      })
      .subscribe((data) => {
        let counter = 100000;

        this.appointments = data
          .map((a) =>
            a.isRecurringInstance
              ? { ...a, id: counter++, originalAppointmentId: a.id }
              : { ...a }
          )
          .filter(
            (a) =>
              a.categories === 'ordinario' || a.categories === 'straordinario'
          );

        this.sortAppointments(); // 👈 ora normalizza+ordina in modo robusto
        this.loading = false;
        this.loadExistingShifts();
      });
  }

  // 🔹 Ordinamento
  // 🔧 Normalizza e ordina in modo stabile
  private sortAppointments(): void {
    const baseDate = new Date(this.selectedDate);

    const normalize = (val: any): Date | null => {
      if (val instanceof Date) return val;

      if (typeof val === 'string') {
        // Se è solo HH:mm → ancoralo alla selectedDate
        if (/^\d{1,2}:\d{2}$/.test(val)) {
          const [h, m] = val.split(':').map(Number);
          const d = new Date(baseDate);
          d.setHours(h, m, 0, 0);
          return d;
        }

        // Se è ISO o contiene anche la data → parse normale
        const d = new Date(
          val.includes(' ') && !val.includes('T') ? val.replace(' ', 'T') : val
        );
        return isNaN(d.getTime()) ? null : d;
      }

      if (typeof val === 'number') return new Date(val);

      return null;
    };

    // normalizza start/end
    for (const a of this.appointments) {
      a.startDate = normalize(a.startDate) ?? new Date(baseDate);
      a.endDate =
        normalize(a.endDate) ?? new Date(a.startDate.getTime() + 60 * 60000);
    }

    // ordina
    this.appointments.sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );
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
      endDate: end,
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
      data: dateStr
    };
  
    if (app.isExtra && app.id.startsWith('extra-')) {
      const numericId = Number(app.id.replace('extra-', ''));
      if (!isNaN(numericId)) {
        payload.shiftId = numericId;
      }
    }
  
    this.http.post(this.globalService.url + 'shifts/delete', payload)
      .subscribe(() => {
        this.appointments = this.appointments.filter(a => a.id !== app.id);
      });
  }
  

  // 🔹 Gestione orari
  getShiftTime(app: any, type: 'start' | 'end' = 'start'): string {
    const d =
      (type === 'start' ? app.startDate : app.endDate) instanceof Date
        ? type === 'start'
          ? app.startDate
          : app.endDate
        : new Date(type === 'start' ? app.startDate : app.endDate);

    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  updateTime(app: any, newValue: string, type: 'start' | 'end'): void {
    if (!newValue || !/^\d{1,2}:\d{2}$/.test(newValue)) return;
  
    const [h, m] = newValue.split(':').map(Number);
    const d = new Date(this.selectedDate);
    d.setHours(h, m, 0, 0);
  
    if (type === 'start') {
      app.startDate = d;
      // se la fine è assente o precedente all'inizio → allinea alla start (consente uguaglianza)
      if (!app.endDate || new Date(app.endDate).getTime() < d.getTime()) {
        app.endDate = new Date(d.getTime());
      }
    } else {
      app.endDate = d;
      // se la fine è prima dell'inizio → riallinea (consente uguaglianza)
      if (new Date(app.endDate).getTime() < new Date(app.startDate).getTime()) {
        app.endDate = new Date(app.startDate.getTime());
      }
    }
  
    this.sortAppointments();
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
        busyEmployees: this.getBusyEmployees(app),
        requiredEmployees: app.requiredEmployees,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (Array.isArray(result)) this.assignedShifts[app.id] = result;
    });
  }

  getBusyEmployees(currentApp: any): number[] {
    const busy: number[] = [];
    const currentStart = new Date(currentApp.startDate).getTime();
    const currentEnd = new Date(currentApp.endDate).getTime();

    for (const a of this.appointments) {
      if (a.id === currentApp.id) continue;
      const start = new Date(a.startDate).getTime();
      const end = new Date(a.endDate).getTime();
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

 // 🔹 Salvataggio
finalSave(): void {
  // 🔎 Controllo lavori incompleti
  const incomplete = this.appointments.filter((app) => {
    const assigned = this.assignedShifts[app.id] || [];
    return assigned.length < (app.requiredEmployees || 1);
  });

  // 🔎 Controllo conflitti
  const conflicts: { employeeId: number; hour: string }[] = [];
  const hourMap: { [hour: string]: number[] } = {};

  this.appointments.forEach((app) => {
    const start =
      app.startDate instanceof Date ? app.startDate : new Date(app.startDate);
    const hourKey = start.getHours().toString().padStart(2, '0') + ':00';
    const assigned = this.assignedShifts[app.id] || [];

    if (!hourMap[hourKey]) hourMap[hourKey] = [];

    assigned.forEach((emp) => {
      if (hourMap[hourKey].includes(emp)) {
        conflicts.push({ employeeId: emp, hour: hourKey });
      } else {
        hourMap[hourKey].push(emp);
      }
    });
  });

  if (incomplete.length > 0 || conflicts.length > 0) {
    let msg = '';

    if (incomplete.length > 0) {
      msg += `⚠️ Lavori incompleti:\n\n${incomplete
        .map((a) => `• ${this.getShiftTime(a)} ${a.title}`)
        .join('\n')}\n\n`;
    }

    if (conflicts.length > 0) {
      msg += `⚠️ Conflitti dipendenti:\n\n${conflicts
        .map((c) => `• ${this.getEmployeeName(c.employeeId)} alle ${c.hour}`)
        .join('\n')}\n\n`;
    }

    msg += 'Vuoi salvare comunque?';
    if (!confirm(msg)) return;
  }

  // ✅ Costruzione payload
  const dateStr = this.formatDate(this.selectedDate);

  const payload = this.appointments.map((app) => {
    const start =
      app.startDate instanceof Date ? app.startDate : new Date(app.startDate);
    const end =
      app.endDate instanceof Date ? app.endDate : new Date(app.endDate);

      if (app.isExtra || String(app.id).startsWith('extra-')) {
        const isPersisted = app.id.startsWith('extra-') && !isNaN(Number(app.id.replace('extra-', '')));
        return {
          shiftId: isPersisted ? Number(app.id.replace('extra-', '')) : null,
          appointmentId: null,
          data: dateStr,
          employeeIds: this.assignedShifts[app.id] || [],
          title: app.title,
          description: app.description,
          startDate: this.toSqlDateTime(start),
          endDate: this.toSqlDateTime(end),
        };
      }
       else {
      // 🔹 Turno normale → salvo anche orari come override
      return {
        shiftId: app.shiftId || null,   // 👈 utile se già salvato
        appointmentId: app.originalAppointmentId || app.id,
        data: dateStr,
        employeeIds: this.assignedShifts[app.id] || [],
        startDate: this.toSqlDateTime(start),
        endDate: this.toSqlDateTime(end),
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

  // 🔹 Turni precedenti
  showPreviousWeekShifts(): void {
    const prevDate = new Date(this.selectedDate);
    prevDate.setDate(prevDate.getDate() - 7);
    const dateStr = this.formatDate(prevDate);

    this.http
      .get<any[]>(this.globalService.url + `shifts/byDate/${dateStr}`)
      .subscribe((data) => {
        const mappa: { [cliente: string]: string[] } = {};
        for (const s of data) {
          const title = s.appointment?.title || '---';
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

  isComplete(app: any): boolean {
    const assigned = this.assignedShifts[app.id] || [];
    return assigned.length >= (app.requiredEmployees || 1);
  }

  goBack(): void {
    this.router.navigate(['/admin/shifts']);
  }
}
