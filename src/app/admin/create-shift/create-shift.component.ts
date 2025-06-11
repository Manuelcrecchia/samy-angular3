import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AssignDialogComponent } from '../assign-dialog/assign-dialog.component';

@Component({
  selector: 'app-create-shift',
  templateUrl: './create-shift.component.html',
  styleUrl: './create-shift.component.css'
})
export class CreateShiftComponent {
  selectedDate: Date = new Date();
  appointments: any[] = [];
  assignedShifts: { [appointmentId: number]: number[] } = {};
  loading = false;
  employeeList: any[] = [];

  hours = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00'
  ];

  constructor(
    private http: HttpClient,
  private route: ActivatedRoute,
  private router: Router,
  private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const queryDate = this.route.snapshot.queryParamMap.get('date');
    if (queryDate) this.selectedDate = new Date(queryDate);
    this.loadAppointments();
    this.http.get<any[]>('http://localhost:5000/employees/getAll').subscribe(res => {
      this.employeeList = res;
    });
  }

  getEmployeeName(id: number): string {
    const found = this.employeeList.find(e => e.id === id);
    return found ? `${found.nome} ${found.cognome}` : `ID ${id}`;
  }


  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  prevDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    this.selectedDate = newDate;
    this.loadAppointments();
  }

  getDynamicHours(): string[] {
    const hourSet = new Set<string>();

    this.appointments.forEach(a => {
      const h = new Date(a.startDate).getHours();
      hourSet.add(String(h).padStart(2, '0') + ':00');
    });

    return Array.from(hourSet).sort(); // es. ['05:00', '06:00', '08:00']
  }


  nextDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    this.selectedDate = newDate;
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    const dateStr = this.formatDate(this.selectedDate);

    this.http.post<any[]>('http://localhost:5000/appointments/byDate', { date: dateStr })
      .subscribe(data => {
        console.log('Dati ricevuti:', data); // 🔍 CONTROLLA QUI
        this.appointments = data.filter(a =>
          a.categories === 'ordinario' || a.categories === 'straordinario'
        );
        this.hours = this.getDynamicHours();
        this.loading = false;
      });
  }

  getAppointmentsByHour(hour: string): any[] {
    const targetHour = parseInt(hour.split(':')[0], 10);
    return this.appointments.filter(a => {
      const h = new Date(a.startDate).getHours();
      return h === targetHour;
    });
  }




  isComplete(app: any): boolean {
    const assigned = this.assignedShifts[app.id];
    return assigned && assigned.length >= app.requiredEmployees;
  }

  getBusyEmployees(currentApp: any): number[] {
    const currentHour = new Date(currentApp.startDate).getHours();

    const overlaps = this.appointments.filter(a =>
      a.id !== currentApp.id &&
      new Date(a.startDate).getHours() === currentHour
    );

    const busy: number[] = [];
    for (const o of overlaps) {
      const assigned = this.assignedShifts[o.id] || [];
      busy.push(...assigned);
    }

    return busy;
  }


  openAssignmentDialog(app: any): void {
    const busyEmployees = this.getBusyEmployees(app);
    const assigned = this.assignedShifts[app.id] || [];

    const dialogRef = this.dialog.open(AssignDialogComponent, {
      width: '500px',
      data: {
        ...app,
        assigned,
        busyEmployees,
        requiredEmployees: app.requiredEmployees
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (Array.isArray(result)) {
        this.assignedShifts[app.id] = result;
      }
    });
  }


  finalSave(): void {
    const incomplete = this.appointments.filter(app => {
      const assigned = this.assignedShifts[app.id] || [];
      return assigned.length < app.requiredEmployees;
    });

    // 🔍 Raggruppa per ora e raccogli i dipendenti doppi
    const conflicts: { employeeId: number, hour: string }[] = [];
    const hourMap: { [hour: string]: number[] } = {}; // ora => lista di dipendenti

    this.appointments.forEach(app => {
      const hour = new Date(app.startDate).toISOString().slice(11, 13); // 'HH'
      const assigned = this.assignedShifts[app.id] || [];

      if (!hourMap[hour]) hourMap[hour] = [];

      assigned.forEach(emp => {
        if (hourMap[hour].includes(emp)) {
          conflicts.push({ employeeId: emp, hour });
        } else {
          hourMap[hour].push(emp);
        }
      });
    });

    const dettagli = incomplete.map(a =>
      `• [${a.startDate.slice(11, 16)}] ${a.title} (ID ${a.id})`
    ).join('\n');

    const duplicati = conflicts.map(c =>
      `• ${this.getEmployeeName(c.employeeId)} ha più lavori alle ${c.hour}:00`
    ).join('\n');



    if (incomplete.length > 0 || conflicts.length > 0) {
      let msg = '';

      if (incomplete.length > 0) {
        msg += `⚠️ I seguenti lavori NON hanno abbastanza operatori assegnati:\n\n${dettagli}\n\n`;
      }

      if (conflicts.length > 0) {
        msg += `⚠️ I seguenti dipendenti risultano assegnati a più lavori nello stesso orario:\n\n${duplicati}\n\n`;
      }

      msg += `Vuoi salvare comunque?`;

      const conferma = confirm(msg);
      if (!conferma) return;
    }

    const dateStr = this.formatDate(this.selectedDate);
    const payload = Object.entries(this.assignedShifts).map(([appointmentId, employeeIds]) => ({
      appointmentId: +appointmentId,
      data: dateStr,
      employeeIds
    }));

    this.http.post('http://localhost:5000/shifts/saveMultiple', { shifts: payload })
      .subscribe(() => {
        alert('Turni salvati');
        this.router.navigate(['/admin/shifts']);
      });
  }

}
