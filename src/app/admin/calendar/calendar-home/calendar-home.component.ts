import { Component, ViewChild } from '@angular/core';
import { AppointmentModelService } from '../../../service/appointment-model.service';
import { DxSchedulerComponent } from "devextreme-angular";
import { AppointmentAddingEvent, AppointmentDeletingEvent, AppointmentUpdatingEvent } from 'devextreme/ui/scheduler';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../../service/global.service';
import { Router } from '@angular/router';
import { AutomaticAddInspectionToCalendarService } from '../../../service/automatic-add-inspection-to-calendar.service';

@Component({
  selector: 'app-calendar-home',
  templateUrl: './calendar-home.component.html',
  styleUrl: './calendar-home.component.css',
})
export class CalendarHomeComponent {
  events : AppointmentModelService[] = [];
  currentDate: Date = new Date();
  @ViewChild(DxSchedulerComponent, { static: false }) scheduler!: DxSchedulerComponent;  categories = [
    { id: 'ordinario', text: 'ordinario' },
    { id: 'straordinario', text: 'straordinario' },
    { id: 'sopralluogo', text: 'sopralluogo' },
    { id: 'altro', text: 'altro' }
  ];
  constructor(private http: HttpClient, private globalService: GlobalService, private router: Router, private automaticAddInspectionToCalendarservice: AutomaticAddInspectionToCalendarService) {} // Inject HttpClient module
  ngOnInit(){
    this.http
    .get(this.globalService.url + 'appointments/getAll', {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      this.events = JSON.parse(response);
      if(this.automaticAddInspectionToCalendarservice.pass){
        this.automaticAddInspectionToCalendarservice.pass = false;
        const startDate = new Date();
    const endDate = new Date();
    endDate.setMinutes(endDate.getMinutes() + 30); // Imposta la data di fine 30 minuti dopo la data di inizio
    let descrizione = 'Contatto' + this.automaticAddInspectionToCalendarservice.nominativo + '   Telefono: ' + this.automaticAddInspectionToCalendarservice.telefono;
        this.scheduler.instance.showAppointmentPopup({
          startDate: startDate,
          endDate:endDate,
          title: this.automaticAddInspectionToCalendarservice.numeroPreventivo,
          description: descrizione,
          categories: 'sopralluogo',
        }, true);
      }
    });
  }


  onAppointmentFormOpening(e: any) {
    const form = e.form;
    const startDate = form.getEditor('startDate').option('value');
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30); // Imposta la data di fine 30 minuti dopo la data di inizio
    form.getEditor('endDate').option('value', endDate);
    const categories = this.categories;
  form.option('items', [
    {
      dataField: 'title',
      editorType: 'dxTextBox',
      label: { text: 'Numero preventivo' }
    },
    {
      dataField: 'description',
      editorType: 'dxTextArea',
      label: { text: 'Dettagli' }
    },
    {
      dataField: 'startDate',
      editorType: 'dxDateBox',
      label: { text: 'Data di inizio' },
      editorOptions: {
        type: 'datetime',
        displayFormat: 'yyyy-MM-dd HH:mm'
      }
    },
    {
      dataField: 'endDate',
      editorType: 'dxDateBox',
      label: { text: 'Data di fine' },
      editorOptions: {
        type: 'datetime',
        displayFormat: 'yyyy-MM-dd HH:mm'
      }
    },
    {
      dataField: 'categories',
      editorType: 'dxSelectBox',
      label: { text: 'Categorie' },
      editorOptions: {
        items: categories,
        displayExpr: 'text',
        valueExpr: 'id'
      }
    },
    {
      dataField: 'recurrenceRule',
      editorType: 'dxRecurrenceEditor',
      label: { text: 'Ricorrenza' },
      editorOptions: {
        recurrenceRule: {
          daily: true,
          weekly: true,
          monthly: true,        }
      }
    },
    {
      itemType: 'button',
      horizontalAlignment: 'right',
      buttonOptions: {
        text: 'Cancella',
        type: 'danger',
        onClick: () => {
          this.scheduler.instance.deleteAppointment(e.appointmentData)
        }
      }
    }
  ])  }

  onAppointmentAdding (e: AppointmentAddingEvent) {
    console.log(e);
        let body = {
      title: e.appointmentData['title'],
      startDate: e.appointmentData['startDate'],
      endDate: e.appointmentData['endDate'],
      recurrence: e.appointmentData['recurrenceRule'],
      dayLong: e.appointmentData['dayLong'],
      description: e.appointmentData['description'],
      categories: e.appointmentData['categories'],
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
      categories: e.newData['categories'],
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
