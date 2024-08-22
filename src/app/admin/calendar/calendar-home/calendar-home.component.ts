import { Component } from '@angular/core';
import { AppointmentModelService } from '../../../service/appointment-model.service';
import { DxButtonModule, DxSchedulerModule, DxSchedulerComponent } from "devextreme-angular";
import { AppointmentAddingEvent, AppointmentDeletingEvent, AppointmentUpdatingEvent } from 'devextreme/ui/scheduler';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../../service/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar-home',
  templateUrl: './calendar-home.component.html',
  styleUrl: './calendar-home.component.css',
})
export class CalendarHomeComponent {
  events : AppointmentModelService[] = [];
  currentDate: Date = new Date();
  scheduler!: DxSchedulerComponent;
  constructor(private http: HttpClient, private globalService: GlobalService, private router: Router) {} // Inject HttpClient module
  ngOnInit(){
    this.http
    .get(this.globalService.url + 'appointments/getAll', {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      this.events = JSON.parse(response);
      console.log(this.events); // Aggiungi questo log per verificare i dati ricevuti

    });
  }

  onAppointmentFormOpening(e: any) {
    const form = e.form;
    const startDate = form.getEditor('startDate').option('value');
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30); // Imposta la data di fine 30 minuti dopo la data di inizio
    form.getEditor('endDate').option('value', endDate);
  }

  onAppointmentAdding (e: AppointmentAddingEvent) {
    let body = {
      title: e.appointmentData['title'],
      startDate: e.appointmentData['startDate'],
      endDate: e.appointmentData['endDate'],
      recurrence: e.appointmentData['recurrence'],
      dayLong: e.appointmentData['dayLong'],
      description: e.appointmentData['description'],
    }
    this.http
        .post(this.globalService.url + 'appointments/add', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          console.log(response);
        });
  }

  onAppointmentUpdating (e: AppointmentUpdatingEvent) {
    console.log(e);
    let body = {
      id: e.oldData['id'],
      title: e.newData['title'],
      startDate: e.newData['startDate'],
      endDate: e.newData['endDate'],
      recurrence: e.newData['recurrence'],
      dayLong: e.newData['dayLong'],
      description: e.newData['description'],
    }
    this.http
        .post(this.globalService.url + 'appointments/edit', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          console.log(response);
        });
  }

  onAppointmentDeleting (e: AppointmentDeletingEvent) {
    let body = {
      id: e.appointmentData['id'],
    }
    this.http
        .post(this.globalService.url + 'appointments/delete', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          console.log(response);
        });
      
  }
  goback(){
    this.router.navigateByUrl('homeAdmin');
   }
}
