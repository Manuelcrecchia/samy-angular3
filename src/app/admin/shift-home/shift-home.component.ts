import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shift-home',
  templateUrl: './shift-home.component.html',
  styleUrl: './shift-home.component.css'
})
export class ShiftHomeComponent {
  selectedDate = new Date();
  shifts: any[] = [];
  groupedByEmployee: { [key: string]: { title: string; start: string; end: string }[] } = {};

  groupedKeys(): string[] {
    return Object.keys(this.groupedByEmployee || {}).sort();
  }


  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadShifts();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  organizeByEmployee(shifts: any[]): any {
    const result: { [key: string]: any[] } = {};

    for (const shift of shifts) {
      for (const emp of shift.employees) {
        const key = `${emp.nome} ${emp.cognome}`;
        if (!result[key]) result[key] = [];

        result[key].push({
          title: shift.appointment.title,
          start: shift.appointment.startDate,
          end: shift.appointment.endDate
        });
      }
    }

    // ordina ogni array per orario
    for (const k in result) {
      result[k].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }

    return result;
  }

  loadShifts() {
    const dateStr = this.formatDate(this.selectedDate);
    this.http.get<any[]>(`http://localhost:5000/shifts/byDate/${dateStr}`)
          .subscribe(data => {
        this.groupedByEmployee = this.organizeByEmployee(data);
        console.log(data);
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
    this.router.navigate(['/admin/shifts/create'], { queryParams: { date: this.formatDate(this.selectedDate) } });
  }
}
