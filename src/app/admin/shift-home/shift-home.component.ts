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

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadShifts();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadShifts(): void {
    const dateStr = this.formatDate(this.selectedDate);
    this.http.get<any[]>(`http://localhost:5000/shifts/byDate/${dateStr}`)
      .subscribe(data => this.shifts = data);
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
