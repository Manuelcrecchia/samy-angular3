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

  busyIds: number[] = [];
  forceConfirmed = false;

  ngOnInit(): void {
    this.selectedEmployees = [...(this.data.assigned || [])];

    this.http.get<any[]>(this.globalService.url + 'employees/getAll')
    .subscribe(res => {
      this.employees = res.sort((a, b) => {
        const nameA = (a.nome + ' ' + a.cognome).toLowerCase();
        const nameB = (b.nome + ' ' + b.cognome).toLowerCase();
        return nameA.localeCompare(nameB, 'it'); // 👈 ordina alfabeticamente (in italiano)
      });
    });
  

      if (this.data.busyDetails) {
        this.busyIds = this.data.busyDetails.map((c: any) => c.employeeId);
      }
  }

  isBusy(empId: number): boolean {
    return this.busyIds.includes(empId);
  }

  onSave(): void {
    // Controllo 1: numero minimo
    if (this.selectedEmployees.length < (this.data.requiredEmployees || 1)) {
      const proceed = confirm(
        `⚠️ Devi assegnare almeno ${this.data.requiredEmployees || 1} dipendenti.\n\nVuoi salvare lo stesso?`
      );
      if (!proceed) return;
    }
  
    // Controllo 2: conflitti
    const conflicts = this.selectedEmployees
    .map(id => this.data.busyDetails.find((c: any) => c.employeeId === id))
    .filter(Boolean);
    if (conflicts.length > 0) {
      let msg = "⚠️ Alcuni dipendenti sono già occupati:\n\n";
      for (const c of conflicts) {
        const emp = this.employees.find(e => e.id === c.employeeId);
        const empName = emp ? `${emp.nome} ${emp.cognome}` : `ID ${c.employeeId}`;
        const hours = `${c.start} (durata ${Math.round(c.duration/60)}h)`;
        msg += `• ${empName} è occupato su "${c.title}" alle ${hours}\n`;
      }
    
      msg += "\nVuoi salvare comunque?";
    
      const proceed = confirm(msg);
      if (!proceed) return;
    }
    this.forceConfirmed = true;

  
    // ✅ Se tutto ok (o confermato) chiudo
    this.dialogRef.close({
      employees: this.selectedEmployees,
      forceConfirmed: this.forceConfirmed
    });
        
  }
  

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
