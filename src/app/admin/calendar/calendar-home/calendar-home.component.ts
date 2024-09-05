import { Component, ViewChild } from '@angular/core';
import { AppointmentModelService } from '../../../service/appointment-model.service';
import { DxSchedulerComponent } from "devextreme-angular";
import { AppointmentAddingEvent, AppointmentDeletingEvent, AppointmentUpdatingEvent } from 'devextreme/ui/scheduler';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../../service/global.service';
import { Router } from '@angular/router';
import { AutomaticAddInspectionToCalendarService } from '../../../service/automatic-add-inspection-to-calendar.service';
import { PopupServiceService } from '../../../componenti/popup/popup-service.service';

@Component({
  selector: 'app-calendar-home',
  templateUrl: './calendar-home.component.html',
  styleUrl: './calendar-home.component.css',
})
export class CalendarHomeComponent {
  events : AppointmentModelService[] = [];
  currentDate: Date = new Date();
  @ViewChild(DxSchedulerComponent, { static: false }) scheduler!: DxSchedulerComponent;  categories = [
    { id: 'Ordinario', text: 'Ordinario' },
    { id: 'Straordinario', text: 'Straordinario' },
    { id: 'Sopralluogo', text: 'Sopralluogo' },
    { id: 'Altro', text: 'Altro' }
  ];
  nPreventiviArray: string[] = [];
  descrizioneArray: string[] = [];
  categoriaArray: string[] = []; 

  constructor(private http: HttpClient, private globalService: GlobalService, private router: Router, private automaticAddInspectionToCalendarservice: AutomaticAddInspectionToCalendarService, private popup: PopupServiceService) {} // Inject HttpClient module
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
    let descrizione = 'Contatto ' + this.automaticAddInspectionToCalendarservice.nominativo + '   Telefono: ' + this.automaticAddInspectionToCalendarservice.telefono;
        this.scheduler.instance.showAppointmentPopup({
          startDate: startDate,
          endDate:endDate,
          title: this.automaticAddInspectionToCalendarservice.numeroPreventivo,
          description: descrizione,
          categories: 'Sopralluogo',
        }, true);
      }
      this.http
    .get(this.globalService.url + 'quotes/getAll', {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      const data = JSON.parse(response);
      this.nPreventiviArray = data.map((item: any) => `${item.numeroPreventivo} - ${item.nominativo}`);
      this.descrizioneArray = data.map((item: any) => `Contatto: ${item.nominativo} Telefono: ${item.telefono}`);
      this.categoriaArray = data.map((item: any) => item.tipoPreventivo);
      console.log(this.nPreventiviArray);
    } );
    });
  }




  onAppointmentFormOpening(e: any) {
    const form = e.form;
    const startDate = form.getEditor('startDate').option('value');
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30); // Imposta la data di fine 30 minuti dopo la data di inizio
    form.getEditor('endDate').option('value', endDate);
    const categories = this.categories;
  const searchFieldConfig = {
    dataField: 'title',
    editorType: 'dxAutocomplete',
    editorOptions: {
      dataSource: this.nPreventiviArray,
      minSearchLength: 1,
      searchExpr: 'this',
      placeholder: 'Cerca preventivo...',
      onValueChanged: (args: any) => {
        const selectedValue = args.value;
        const selectedPreventivo = this.nPreventiviArray.find(item => item === selectedValue);
        if (selectedPreventivo) {
          const descrizione = this.descrizioneArray[this.nPreventiviArray.indexOf(selectedPreventivo)];
          let categoria = this.categoriaArray[this.nPreventiviArray.indexOf(selectedPreventivo)];
          categoria == "O" ? categoria = "Ordinario" : categoria = "Straordinario";
          console.log(categoria);
          form.getEditor('description').option('value', descrizione);
          form.getEditor('categories').option('value', categoria);
        }
      }
    },
    label: { text: 'Numero preventivo' }
  };

  form.option('items', [
    searchFieldConfig,
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
        displayFormat: 'yyyy-MM-dd HH:mm',
        onValueChanged: (args: any) => {
          const startDate = new Date(args.value);
    const endDateEditor = form.getEditor('endDate');
    const endDate = new Date(startDate.getTime() + 30 * 60000);
    endDateEditor.option('value', endDate);
        }
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
          this.http
        .post(this.globalService.url + 'appointments/sendInspectionConfirmation', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          if(response == 'NO'){
            this.popup.text = "Non è stato possibile inviare la mail di conferma dell'appuntamento perchè non è presente nessuna mail associata al preventivo";
            this.popup.openPopup();          }
        });
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

  goBack(){
    this.router.navigateByUrl('homeAdmin');
   }
}
