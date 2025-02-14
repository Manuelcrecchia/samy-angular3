import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<any[]>([]);
  employees$ = this.employeesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadEmployees() {
    const apiUrl = 'https://tuo-server/api/employees';
    this.http.get(apiUrl).subscribe(
      (response: any) => {
        this.employeesSubject.next(response);
      },
      (error) => {
        console.error('Errore durante il caricamento dei dipendenti:', error);
      }
    );
  }

  addEmployee(employee: any) {
    const currentEmployees = this.employeesSubject.value;
    this.employeesSubject.next([...currentEmployees, employee]);
  }

  deleteEmployee(email: string) {
    const currentEmployees = this.employeesSubject.value.filter(
      (emp) => emp.email !== email
    );
    this.employeesSubject.next(currentEmployees);
  }
}
