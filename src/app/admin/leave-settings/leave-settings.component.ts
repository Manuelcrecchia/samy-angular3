import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-leave-settings',
  templateUrl: './leave-settings.component.html',
  styleUrls: ['./leave-settings.component.css'],
})
export class LeaveSettingsComponent implements OnInit {
  limit: number = 0;
  message: string = '';

  constructor(private http: HttpClient, private global: GlobalService) {}

  ngOnInit(): void {
    this.http.get(`${this.global.url}admin/settings/leave-limit`).subscribe({
      next: (res: any) => {
        this.limit = res.leaveLimitDays ?? 0;
      },
    });
  }

  saveLimit(): void {
    this.http
      .post(`${this.global.url}admin/settings/leave-limit`, {
        leaveLimitDays: this.limit,
      })
      .subscribe({
        next: (res: any) => (this.message = res.message),
        error: () =>
          (this.message = 'Errore durante il salvataggio delle impostazioni.'),
      });
  }
}
