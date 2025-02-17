// frontend/src/app/services/payslip.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayslipService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getPayslips(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payslips`);
  }
}
