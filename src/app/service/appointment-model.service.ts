import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppointmentModelService {

  title: string = "";
  startDate!: Date;
  endDate!: Date;
  recurrenceRule: string = "";
  dayLong: boolean = false;
  description: string = "";
  categories: string = "";

  constructor() { }

}
