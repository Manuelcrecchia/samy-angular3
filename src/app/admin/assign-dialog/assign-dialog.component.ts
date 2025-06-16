import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
@Component({
  selector: 'app-assign-dialog',
  templateUrl: './assign-dialog.component.html',
  styleUrl: './assign-dialog.component.css'
})
export class AssignDialogComponent {
  employees: any[] = [];
  selectedEmployees: number[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AssignDialogComponent>,
    private http: HttpClient,
    private globalService : GlobalService
  ) {}

  ngOnInit(): void {
    this.selectedEmployees = [...(this.data.assigned || [])];

    this.http.get<any[]>(this.globalService.url + 'employees/getAll')
      .subscribe(res => this.employees = res);
  }

  isBusy(empId: number): boolean {
    return this.data.busyEmployees.includes(empId);
  }

  onSave(): void {
    this.dialogRef.close(this.selectedEmployees);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
