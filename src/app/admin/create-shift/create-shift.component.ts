import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AssignDialogComponent } from '../assign-dialog/assign-dialog.component';
import { GlobalService } from '../../service/global.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SocketService } from '../../service/soket.service';

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
    private globalService: GlobalService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    const queryDate = this.route.snapshot.queryParamMap.get('date');
    if (queryDate) this.selectedDate = new Date(queryDate);

    this.loadAppointments();

    // ✅ Socket listener
    this.socketService.onShiftUpdate().subscribe((update: any) => {
      if (update.date && update.date !== this.formatDate(this.selectedDate)) {
        return;
      }
      console.log('📡 Aggiornamento ricevuto:', update);

      switch (update.type) {
        case 'addExtra':
          if (!this.appointments.some((a) => a.id === update.data.id)) {
            this.appointments.push(update.data);
            this.sortAppointments();
          }
          break;

        case 'removeExtra':
          this.appointments = this.appointments.filter(
            (a) => a.id !== update.data.id
          );
          break;

        case 'changeDuration':
        case 'updateDuration':
          const jobDur = this.appointments.find((a) => a.id === update.data.id);
          if (jobDur) {
            jobDur.duration = update.data.duration;
            jobDur.durationDisplay = this.formatDuration(update.data.duration);
          }
          break;
        case 'updateTitle':
          const jobTitle = this.appointments.find(
            (a) => a.id === update.data.id
          );
          if (jobTitle) jobTitle.title = update.data.title;
          break;
        case 'updateDescription':
          const jobDesc = this.appointments.find(
            (a) => a.id === update.data.id
          );
          if (jobDesc) jobDesc.description = update.data.description;
          break;
        case 'updateStartDate':
          const job2 = this.appointments.find((a) => a.id === update.data.id);
          if (job2)
            job2.startDate = update.data.startDate
              ? new Date(update.data.startDate)
              : null;
          break;
        case 'assignEmployees':
          this.assignedShifts[update.data.id] = update.data.employees;
          break;
        case 'reorderGeneral':
          this.appointments.sort(
            (a, b) =>
              update.data.find((o: any) => o.id === a.id)?.order -
              update.data.find((o: any) => o.id === b.id)?.order
          );
          break;
        case 'reorderEmployee':
          update.data.jobs.forEach((j: any) => {
            const job = this.appointments.find((a) => a.id === j.id);
            if (job) {
              if (!job.sortOrderByEmployee) job.sortOrderByEmployee = {};
              job.sortOrderByEmployee[update.data.empId] = j.order;
            }
          });
          break;
        case 'reload':
          this.loadAppointments();
          break;
      }

      this.appointments = [...this.appointments];
    });

    this.http
      .get<any[]>(this.globalService.url + 'employees/getAll')
      .subscribe((res) => (this.employeeList = res));

    this.showPreviousWeekShifts();
  }

  // 🔹 Durata
  changeDuration(app: any, delta: number) {
    this.applyDuration(app);
    if (!app.duration) app.duration = 0;
    app.duration = Math.max(0, Math.min(480, app.duration + delta));
    app.durationDisplay = this.formatDuration(app.duration);
    this.socketService.emitUpdate({
      type: 'changeDuration',
      date: this.formatDate(this.selectedDate),
      data: { id: app.id, duration: app.duration },
    });
  }

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
    app.duration = Math.max(0, Math.min(480, app.duration));
    app.durationDisplay = this.formatDuration(app.duration);
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '00.00';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}.${m.toString().padStart(2, '0')}`;
  }

  // 🔹 Ordinamento generale
  dropGeneral(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.appointments, event.previousIndex, event.currentIndex);
    this.appointments.forEach((a, i) => (a.generalOrder = i));
    this.appointments = [...this.appointments];
    this.socketService.emitUpdate({
      type: 'reorderGeneral',
      date: this.formatDate(this.selectedDate),
      data: this.appointments.map((a, i) => ({ id: a.id, order: i })),
    });
  }

  // 🔹 Ordinamento lavori per dipendente
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
    this.employeeList = [...this.employeeList];
    this.socketService.emitUpdate({
      type: 'reorderEmployee',
      date: this.formatDate(this.selectedDate),
      data: {
        empId,
        jobs: event.container.data.map((j, i) => ({ id: j.id, order: i })),
      },
    });
  }

  // 🔹 Aggiornamenti realtime
  onTitleChange(app: any, value: string) {
    app.title = value;
    this.socketService.emitUpdate({
      type: 'updateTitle',
      date: this.formatDate(this.selectedDate),
      data: { id: app.id, title: value },
    });
  }
  onDescriptionChange(app: any, value: string) {
    app.description = value;
    this.socketService.emitUpdate({
      type: 'updateDescription',
      date: this.formatDate(this.selectedDate),
      data: { id: app.id, description: value },
    });
  }
  onTimeTextChange(app: any, value: string) {
    const d = this.parseHourInput(value);
    app.startDate = d;
    this.socketService.emitUpdate({
      type: 'updateStartDate',
      date: this.formatDate(this.selectedDate),
      data: { id: app.id, startDate: d },
    });
  }
  onDurationChange(app: any, value: number) {
    app.duration = value;
    app.durationDisplay = this.formatDuration(value);
    this.socketService.emitUpdate({
      type: 'updateDuration',
      date: this.formatDate(this.selectedDate),
      data: { id: app.id, duration: value },
    });
  }

  // 🔹 Final Save
  finalSave(): void {
    const dateStr = this.formatDate(this.selectedDate);
    const payload = this.appointments.map((app) => {
      let start: string | null = null;
      if (app.startDate instanceof Date && !isNaN(app.startDate.getTime())) {
        start = this.toSqlDateTime(app.startDate);
      }
      return {
        shiftId: app.shiftId || null,
        appointmentId: app.originalAppointmentId || app.id,
        data: dateStr,
        employeeIds: this.assignedShifts[app.id] || [],
        title: app.title,
        description: app.description,
        startDate: start,
        duration: app.duration || 60,
        sortOrderByEmployee: app.sortOrderByEmployee || {},
      };
    });
    this.http
      .post(this.globalService.url + 'shifts/saveMultiple', { shifts: payload })
      .subscribe(() => {
        this.socketService.emitUpdate({
          type: 'reload',
          date: this.formatDate(this.selectedDate),
        });
        alert('Turni salvati');
        this.router.navigate(['/admin/shifts']);
      });
  }

  // 🔹 Helpers
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  parseHourInput(value: string): Date | null {
    if (!value) return null;
    const clean = value.replace(/\D/g, '');
    const d = new Date(this.selectedDate);
    if (clean.length === 4) {
      d.setHours(+clean.slice(0, 2), +clean.slice(2, 4), 0, 0);
      return d;
    }
    if (clean.length === 2) {
      d.setHours(+clean, 0, 0, 0);
      return d;
    }
    if (value.includes(':')) {
      const [h, m] = value.split(':').map(Number);
      d.setHours(h, m, 0, 0);
      return d;
    }
    return null;
  }
  toSqlDateTime(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  // 🔹 UI Helpers
  isComplete(app: any): boolean {
    if (app.forceConfirmed) return true;
    const assigned = this.assignedShifts[app.id] || [];
    return assigned.length >= (app.requiredEmployees || 1);
  }
  goBack(): void {
    this.router.navigate(['/admin/shifts']);
  }

  showPreviousWeekShifts(): void {
    const prevDate = new Date(this.selectedDate);
    prevDate.setDate(prevDate.getDate() - 7);
    const dateStr = this.formatDate(prevDate);

    this.http
      .get<any[]>(this.globalService.url + `shifts/byDate/${dateStr}`)
      .subscribe((data) => {
        const mappa: { [cliente: string]: string[] } = {};

        for (const s of data) {
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
  loadAppointments(): void {
    this.loading = true;
    const dateStr = this.formatDate(this.selectedDate);

    this.appointments = [];

    this.http
      .post<any[]>(this.globalService.url + 'appointments/byDate', {
        date: dateStr,
      })
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
            (a) =>
              a.categories === 'ordinario' || a.categories === 'straordinario'
          )
          .map((a) => {
            if (a.startDate && a.startDate !== 'null' && a.startDate !== '') {
              a.startDate = new Date(a.startDate);
            } else {
              a.startDate = null;
            }

            if (a.endDate && a.endDate !== 'null' && a.endDate !== '') {
              a.endDate = new Date(a.endDate);

              if (a.startDate && a.endDate) {
                const diffMinutes = Math.floor(
                  (a.endDate.getTime() - a.startDate.getTime()) / 60000
                );
                a.duration = diffMinutes > 0 ? diffMinutes : 0;
              }
            }

            if (typeof a.duration !== 'number') {
              a.duration = 0;
            }

            a.durationDisplay = this.formatDuration(a.duration);
            if (typeof a.sortOrderByEmployee === 'string') {
              try {
                a.sortOrderByEmployee = JSON.parse(a.sortOrderByEmployee);
              } catch {
                a.sortOrderByEmployee = {};
              }
            }
            if (!a.sortOrderByEmployee) a.sortOrderByEmployee = {};
            a.sortOrderByEmployee = a.sortOrderByEmployee || {};

            return a;
          });

        this.sortAppointments();
        this.loading = false;
        this.loadExistingShifts();
      });
  }
  loadExistingShifts(): void {
    const dateStr = this.formatDate(this.selectedDate);

    this.http
      .get<any[]>(this.globalService.url + `shifts/byDate/${dateStr}`)
      .subscribe((existing) => {
        for (const s of existing) {
          // Caso 1: turno extra
          if (!s.appointmentId) {
            const extraId = `extra-${s.id}`;
            if (!this.appointments.some((a) => a.id === extraId)) {
              let sortMap: any = s.sortOrderByEmployee;
              if (typeof sortMap === 'string') {
                try {
                  sortMap = JSON.parse(sortMap);
                } catch {
                  sortMap = {};
                }
              }
              if (!sortMap) sortMap = {};
              this.appointments.push({
                id: extraId,
                appointmentId: null,
                isExtra: true,
                title: s.title,
                description: s.description,
                startDate:
                  s.startDate && s.startDate !== 'null' && s.startDate !== ''
                    ? new Date(s.startDate)
                    : null,
                duration: s.duration ?? 60,
                durationDisplay: this.formatDuration(s.duration ?? 60),
                requiredEmployees: 0,
                sortOrderByEmployee: s.sortOrderByEmployee || {},
              });
            }
            this.assignedShifts[extraId] = (s.employees || []).map(
              (e: any) => e.id
            );
          }
          // Caso 2: turno normale
          else {
            const app = this.appointments.find(
              (a) =>
                a.id === s.appointmentId ||
                a.originalAppointmentId === s.appointmentId
            );
            if (app) {
              if ('startDate' in s) {
                app.startDate =
                  s.startDate && s.startDate !== 'null' && s.startDate !== ''
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
              if (typeof s.sortOrderByEmployee === 'string') {
                try {
                  s.sortOrderByEmployee = JSON.parse(s.sortOrderByEmployee);
                } catch {
                  s.sortOrderByEmployee = {};
                }
              }
              if (!s.sortOrderByEmployee) s.sortOrderByEmployee = {};
              app.sortOrderByEmployee = s.sortOrderByEmployee || {};
              this.assignedShifts[app.id] = (s.employees || []).map(
                (e: any) => e.id
              );
            }
          }
        }
        this.sortAppointments();
      });
  }
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
        this.socketService.emitUpdate({
          type: 'assignEmployees',
          date: this.formatDate(this.selectedDate),
          data: { id: app.id, employees: this.assignedShifts[app.id] },
        });
        if (result.forceConfirmed) {
          app.forceConfirmed = true;
        }
      }
    });
  }
  getEmployeeTotalDuration(empId: number): string {
    const jobs = this.getEmployeeShifts(empId);
    const totalMinutes = jobs.reduce(
      (sum, job) => sum + (job.duration || 0),
      0
    );
    return this.formatDuration(totalMinutes);
  }
  getEmployeeShifts(empId: number): any[] {
    const jobs = this.appointments.filter((app) =>
      (this.assignedShifts[app.id] || []).includes(empId)
    );

    return jobs.sort((a, b) => {
      const sa = a.sortOrderByEmployee?.[empId];
      const sb = b.sortOrderByEmployee?.[empId];
      if (sa != null && sb != null) return sa - sb;
      if (sa != null) return -1;
      if (sb != null) return 1;

      if (a.startDate && b.startDate)
        return a.startDate.getTime() - b.startDate.getTime();
      if (a.startDate && !b.startDate) return -1;
      if (!a.startDate && b.startDate) return 1;
      return 0;
    });
  }
  getShiftTime(app: any): string {
    if (!app.startDate) return '';
    const d = new Date(app.startDate);
    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  // 🔹 Ordinamento generale appuntamenti
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
        const d = new Date(
          val.includes(' ') && !val.includes('T') ? val.replace(' ', 'T') : val
        );
        return isNaN(d.getTime()) ? null : d;
      }
      if (typeof val === 'number') return new Date(val);
      return null;
    };

    for (const a of this.appointments) {
      a.startDate = a.startDate != null ? normalize(a.startDate) ?? null : null;
      if (typeof a.duration !== 'number') a.duration = 0;
      a.durationDisplay = this.formatDuration(a.duration);
    }

    this.appointments.sort((a, b) => {
      const empId = null;
      const orderA = empId != null ? a.sortOrderByEmployee?.[empId] : undefined;
      const orderB = empId != null ? b.sortOrderByEmployee?.[empId] : undefined;
      if (orderA != null && orderB != null) return orderA - orderB;
      if (orderA != null) return -1;
      if (orderB != null) return 1;

      if (a.startDate && b.startDate)
        return a.startDate.getTime() - b.startDate.getTime();
      if (a.startDate && !b.startDate) return -1;
      if (!a.startDate && b.startDate) return 1;
      return 0;
    });
  }

  // 🔹 Giorno precedente
  prevDay(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() - 1);
    this.selectedDate = d;
    this.loadAppointments();
    this.showPreviousWeekShifts();
  }

  // 🔹 Giorno successivo
  nextDay(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + 1);
    this.selectedDate = d;
    this.loadAppointments();
    this.showPreviousWeekShifts();
  }

  // 🔹 Aggiungi lavoro extra
  addExtra(): void {
    const newId = 'extra-' + Date.now();
    const newJob = {
      id: newId,
      appointmentId: null,
      isExtra: true,
      title: 'Nuovo lavoro extra',
      description: '',
      startDate: null,
      duration: 0,
      durationDisplay: this.formatDuration(0),
      requiredEmployees: 0,
    };
    this.appointments.push(newJob);
    this.sortAppointments();
    this.socketService.emitUpdate({
      type: 'addExtra',
      date: this.formatDate(this.selectedDate),
      data: newJob,
    });
  }

  // 🔹 Rimuovi lavoro extra
  removeExtra(app: any): void {
    const dateStr = this.formatDate(this.selectedDate);
    const payload: any = { appointmentId: app.appointmentId, data: dateStr };

    if (app.isExtra && app.id.startsWith('extra-')) {
      const numericId = Number(app.id.replace('extra-', ''));
      if (!isNaN(numericId)) {
        payload.shiftId = numericId;
      }
      this.socketService.emitUpdate({
        type: 'removeExtra',
        date: this.formatDate(this.selectedDate),
        data: { id: app.id },
      });
    }

    this.http
      .post(this.globalService.url + 'shifts/delete', payload)
      .subscribe(() => {
        this.appointments = this.appointments.filter((a) => a.id !== app.id);
      });
  }

  // 🔹 Dettagli conflitti dipendenti
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
}
