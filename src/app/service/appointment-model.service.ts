import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppointmentModelService {

id: string = "";
  title: string = "";
  startDate!: Date;
  endDate!: Date;
  recurrenceRule: string = "";
  dayLong: boolean = false;
  description: string = "";
  categories: string = "";
  recurrenceExpection: string = "";

  constructor() { }

}
