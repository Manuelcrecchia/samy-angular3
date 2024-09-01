import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AutomaticAddInspectionToCalendarService {

  pass=false;
  numeroPreventivo: string = '';
  telefono: string = '';
  nominativo: string = '';

  constructor() { }
}
