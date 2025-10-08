import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-timbrature-home',
  templateUrl: './timbrature-home.component.html',
  styleUrls: ['./timbrature-home.component.css'],
})
export class TimbratureHomeComponent implements OnInit {
  employees: any[] = [];
  selectedDate: string = '';
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private global: GlobalService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
    this.loadEmployees();
  }

  // 🔹 Carica dipendenti e controlla errori
  loadEmployees(): void {
    this.loading = true;
    this.http
      .get<any>(
        `${this.global.url}admin/stamping/employees?date=${this.selectedDate}`
      )
      .subscribe({
        next: (res) => {
          this.employees = res.employees || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Errore caricamento dipendenti:', err);
          this.loading = false;
        },
      });
  }

  // 🔹 Naviga nel dettaglio giornaliero
  openDetail(emp: any): void {
    this.router.navigate(['/timbratureDettaglio', emp.id, this.selectedDate]);
  }

  // 🔹 Cambia giorno
  changeDate(delta: number): void {
    const current = new Date(this.selectedDate);
    current.setDate(current.getDate() + delta);
    this.selectedDate = current.toISOString().split('T')[0];
    this.loadEmployees();
  }

  back(): void {
    this.location.back();
  }
}
