import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-hours-report',
  templateUrl: './hours-report.component.html',
  styleUrls: ['./hours-report.component.css'],
})
export class HoursReportComponent implements OnInit {
  selectedDate = new Date().toISOString().split('T')[0];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  dailyReport: Record<string, number> = {};
  monthlyReport: Record<string, number> = {};

  constructor(private http: HttpClient, public global: GlobalService) {}

  ngOnInit(): void {
    this.loadDaily();
    this.loadMonthly();
  }
  onDayChange(ev: MatDatepickerInputEvent<Date>) {
    if (ev.value) {
      this.selectedDate = this.toYMD(ev.value);
      this.loadDaily();
    }
  }
  private toYMD(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadDaily() {
    this.http
      .get<Record<string, number>>(
        this.global.url + `hours/byDay/${this.selectedDate}`
      )
      .subscribe((res) => (this.dailyReport = res));
  }

  loadMonthly() {
    this.http
      .get<Record<string, number>>(
        this.global.url +
          `hours/byMonth/${this.selectedYear}/${this.selectedMonth}`
      )
      .subscribe((res) => (this.monthlyReport = res));
  }
}
