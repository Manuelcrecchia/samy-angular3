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
  selectedVehicleIds: number[] = [];
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<VehicleAssignDialogComponent>,
    private http: HttpClient,
    public globalService: GlobalService,
  ) {}

  ngOnInit(): void {
    const ids = this.data?.assignedVehicleIds;
    if (Array.isArray(ids)) {
      this.selectedVehicleIds = [...ids];
    } else if (this.data?.assignedVehicleId != null) {
      this.selectedVehicleIds = [this.data.assignedVehicleId];
    } else {
      this.selectedVehicleIds = [];
    }
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
        },
        error: (err) => {
          console.error('Errore loadVehicles:', err);
          alert('Errore nel caricamento dei mezzi');
          this.loading = false;
        },
      });
  }

  isSelected(id: number): boolean {
    return this.selectedVehicleIds.includes(id);
  }

  toggleVehicle(id: number) {
    const idx = this.selectedVehicleIds.indexOf(id);
    if (idx >= 0) {
      this.selectedVehicleIds.splice(idx, 1);
    } else {
      this.selectedVehicleIds.push(id);
    }
  }

  clearSelection() {
    this.selectedVehicleIds = [];
  }

  save() {
    this.dialogRef.close({ vehicleIds: this.selectedVehicleIds });
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
