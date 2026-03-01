import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';

interface Vehicle {
  id: number;
  name: string;
  plate?: string | null;
}

@Component({
  selector: 'app-vehicle-assign-dialog',
  templateUrl: './vehicle-assign-dialog.component.html',
  styleUrls: ['./vehicle-assign-dialog.component.css'],
})
export class VehicleAssignDialogComponent implements OnInit {
  vehicles: Vehicle[] = [];
  selectedVehicleId: number | null = null;
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<VehicleAssignDialogComponent>,
    private http: HttpClient,
    public globalService: GlobalService,
  ) {}

  toggleVehicle(id: number) {
    this.selectedVehicleId = this.selectedVehicleId === id ? null : id;
  }

  ngOnInit(): void {
    this.selectedVehicleId = this.data?.assignedVehicleId ?? null;
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading = true;
    this.http
      .get<Vehicle[]>(this.globalService.url + `vehicles/getAll`)
      .subscribe({
        next: (res) => {
          this.vehicles = (res || []).sort((a, b) =>
            (a.name || '').localeCompare(b.name || '', 'it'),
          );
          this.loading = false;
          console.log(this.vehicles);
        },
        error: (err) => {
          console.error('Errore loadVehicles:', err);
          alert('Errore nel caricamento dei mezzi');
          this.loading = false;
        },
      });
  }

  clearSelection() {
    this.selectedVehicleId = null;
  }

  save() {
    this.dialogRef.close({ vehicleId: this.selectedVehicleId });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
