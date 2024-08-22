import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppointmentModelService {

  title: string = "";
  startDate!: Date;
  endDate!: Date;
  recurrence: string = "";
  dayLong: boolean = false;
  description: string = "";

  constructor() { }

}
