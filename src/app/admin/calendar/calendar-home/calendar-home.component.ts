import { Component, ViewChild } from '@angular/core';
import { AppointmentModelService } from '../../../service/appointment-model.service';
import { DxSchedulerComponent } from 'devextreme-angular';
import {
  AppointmentAddingEvent,
  AppointmentDeletedEvent,
  AppointmentUpdatingEvent,
} from 'devextreme/ui/scheduler';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../../service/global.service';
import { Router } from '@angular/router';
import { AutomaticAddInspectionToCalendarService } from '../../../service/automatic-add-inspection-to-calendar.service';
import { PopupServiceService } from '../../../componenti/popup/popup-service.service';
import { MatDialog } from '@angular/material/dialog';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-calendar-home',
  templateUrl: './calendar-home.component.html',
  styleUrl: './calendar-home.component.css',
})
export class CalendarHomeComponent {
  events: AppointmentModelService[] = [];
  filteredEvents: AppointmentModelService[] = [];
  currentDate: Date = new Date();
  currentView: string = 'day';
  saveRecurrenceRule: string = '';
  recurrenceRuleisVisible: boolean = false;
  selectedDate: Date = new Date();
  selectedCategoria: string = '';

  @ViewChild(DxSchedulerComponent, { static: false })
  scheduler!: DxSchedulerComponent;
  categories = [
    { id: 'ordinario', text: 'Ordinario' },
    { id: 'straordinario', text: 'Straordinario' },
    { id: 'sopralluogo', text: 'Sopralluogo' },
    { id: 'lavoriSvolti', text: 'Lavori svolti' },
    { id: 'altro', text: 'Altro' },
  ];
  nPreventiviArray: string[] = [];
  descrizioneArray: string[] = [];
  categoriaArray: string[] = [];
  clientiArray: any[] = [];

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private router: Router,
    private automaticAddInspectionToCalendarservice: AutomaticAddInspectionToCalendarService,
    private popup: PopupServiceService,
    private dialog: MatDialog
  ) {} // Inject HttpClient module

  ngOnInit() {
    this.saveRecurrenceRule = '';
    this.recurrenceRuleisVisible = false;
    this.http
      .get(this.globalService.url + 'appointments/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {
        this.events = JSON.parse(response);
        this.filteredEvents = this.events;
        if (this.automaticAddInspectionToCalendarservice.pass) {
          this.automaticAddInspectionToCalendarservice.pass = false;
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMinutes(endDate.getMinutes() + 30);
          let descrizione =
            'Contatto ' +
            this.automaticAddInspectionToCalendarservice.nominativo +
            '   Telefono: ' +
            this.automaticAddInspectionToCalendarservice.telefono;
          this.scheduler.instance.showAppointmentPopup(
            {
              startDate: startDate,
              endDate: endDate,
              title: `${this.automaticAddInspectionToCalendarservice.numeroPreventivo} - ${this.automaticAddInspectionToCalendarservice.nominativo}`,
              description: descrizione,
              categories: 'sopralluogo',
            },
            true
          );
        }
        this.http
          .get(this.globalService.url + 'quotes/getAll', {
            headers: this.globalService.headers,
            responseType: 'text',
          })
          .subscribe((response) => {
            const data = JSON.parse(response);
            this.nPreventiviArray = data
              .filter((item: any) => !item.complete) // solo quelli non completati
              .map(
                (item: any) => `${item.numeroPreventivo} - ${item.nominativo}`
              );

            this.descrizioneArray = data.map(
              (item: any) =>
                `Contatto: ${item.nominativo} Telefono: ${item.telefono}`
            );
            this.categoriaArray = data.map((item: any) => item.tipoPreventivo);
          });
      });

    this.http
      .get(this.globalService.url + 'customers/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {
        this.clientiArray = JSON.parse(response);
      });
  }

  convertDateToICSFormat(date: Date) {
    // Crea un oggetto Date a partire dalla stringa fornita
    const parsedDate = new Date(date);

    // Estrai le componenti della data
    const year = parsedDate.getUTCFullYear();
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0'); // I mesi sono zero-indexed, quindi +1
    const day = String(parsedDate.getUTCDate()).padStart(2, '0');
    const hours = String(parsedDate.getUTCHours()).padStart(2, '0');
    const minutes = String(parsedDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(parsedDate.getUTCSeconds()).padStart(2, '0');

    // Crea la stringa nel formato desiderato
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  private normalize(s: string): string {
    return (s || '')
      .normalize('NFD')                // separa lettere e accenti
      .replace(/\p{Diacritic}/gu, '')  // elimina diacritici
      .toLowerCase()
      .trim();
  }
  
  
  private updateNavigatorCaption() {
    if (!this.scheduler) return;
    const rawDate = this.scheduler.instance.option('currentDate');
    if (!rawDate) return;
  
    const date = new Date(rawDate as string | number | Date);
    const formatted = formatDate(date, 'EEEE d MMMM yyyy', 'it-IT');
  
    const toolbar = this.scheduler.instance
      .element()
      .querySelector('.dx-scheduler-navigator-caption');
    if (toolbar) {
      toolbar.textContent = formatted!;
    }
  }

  onSchedulerContentReady() {
    // Chiamato ogni volta che lo scheduler ha finito di renderizzare la vista
   this.updateNavigatorCaption();
  }
  
  onCurrentViewChange(event: any) {
    // Aggiorna la view corrente
    if (event.name === 'currentView' || event.name === 'currentDate') {
      this.currentView = event.value;
      this.updateNavigatorCaption();
    }
  }
  
  ngAfterViewInit() {
    // quando lo scheduler è pronto, aggiorna subito il titolo
    this.updateNavigatorCaption();
  }
  

  onAppointmentFormOpening(e: any) {
    const form = e.form;
  const popup = e.popup;

  const toolbarItems = popup.option('toolbarItems');
  toolbarItems.forEach((item: any) => {
    if (item.shortcut === 'cancel') {
      this.currentDate = new Date();
      this.currentView = 'day';
      this.recurrenceRuleisVisible = false;
      this.saveRecurrenceRule = '';
      form.itemOption('recurrenceRule', 'visible', false);
    }
  });
  popup.option('toolbarItems', toolbarItems);

  const startDate = form.getEditor('startDate').option('value');
  this.selectedDate = new Date(startDate);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 30);
  form.getEditor('endDate').option('value', endDate);

  const categories = this.categories;

  const searchFieldConfig = {
    dataField: 'title',
    editorType: 'dxAutocomplete',
    editorOptions: {
      dataSource: [
        ...this.nPreventiviArray,
        ...this.clientiArray.map(c => `${c.numeroCliente} - ${c.nominativo}`),
      ],
      minSearchLength: 0,
      showDropDownButton: true,
      valueExpr: undefined,
      placeholder: 'Cerca preventivo o cliente...',
      onOpened: (e: any) => e.component.option('opened', true),
      onFocusIn: (e: any) => e.component.open(),
      onValueChanged: (args: any) => {
        const selectedValue: string = args.value;
        const formCategoria = form.getEditor('categories');

        // PREVENTIVO
        const idxPrev = this.nPreventiviArray.findIndex(
          item => this.normalize(item) === this.normalize(selectedValue)
        );
        if (idxPrev !== -1) {
          const descrizione = `Sopralluogo – ${this.descrizioneArray[idxPrev]}`;
          formCategoria.option('value', 'sopralluogo');
          form.getEditor('description').option('value', descrizione);
          return;
        }

        // CLIENTE
        const cliente = this.clientiArray.find(
          c =>
            this.normalize(`${c.numeroCliente} - ${c.nominativo}`) ===
            this.normalize(selectedValue)
        );
        if (cliente) {
          const categoria =
            cliente.tipoCliente === 'O' ? 'ordinario' : 'straordinario';
          formCategoria.option('value', categoria);
          return;
        }

        // VALORE NON VALIDO
        formCategoria.option('value', null);
        form.getEditor('description').option('value', '');
      },
    },
    label: { text: 'Numero preventivo' },
  };

    const switchConfig = {
      dataField: 'enableRecurrence',
      editorType: 'dxSwitch',
      label: { text: 'Abilita Ricorrenza' },
      editorOptions: {
        onValueChanged: (args: any) => {
          const show = args.value;
          this.recurrenceRuleisVisible = show;
          form.itemOption('recurrenceRule', 'visible', show);

          if (!show) {
            this.saveRecurrenceRule = '';
            form.getEditor('recurrenceRule').option('value', null);
          }
        },
      },
    };

    const recurrenceRuleConfig = {
      dataField: 'recurrenceRule',
      editorType: 'dxRecurrenceEditor',
      value: this.recurrenceRuleisVisible,
      label: { text: 'Ricorrenza' },
      visible: false,
      editorOptions: {
        recurrenceRule: {
          daily: true,
          weekly: true,
          monthly: true,
          end: false,
        },

        onValueChanged: (args: any) => {
          // Gestione per la ricorrenza settimanale
          if (
            args.value != null &&
            args.value.startsWith('FREQ=WEEKLY;') &&
            (args.previousValue == null ||
              (args.previousValue != null &&
                !args.previousValue.startsWith('FREQ=WEEKLY;')))
          ) {
            const dayOfWeek = this.selectedDate.getDay();
            const recurrenceEditor = args.component;
            this.saveRecurrenceRule = args.value;
            recurrenceEditor.option(
              'value',
              `FREQ=WEEKLY;BYDAY=${
                ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][dayOfWeek]
              }`
            );
          }
          // Gestione per la ricorrenza mensile
          else if (
            args.value != null &&
            args.value.startsWith('FREQ=MONTHLY;') &&
            (args.previousValue == null ||
              (args.previousValue != null &&
                !args.previousValue.startsWith('FREQ=MONTHLY;')))
          ) {
            const dayOfMonth = this.selectedDate.getDate();
            const recurrenceEditor = args.component;
            this.saveRecurrenceRule = args.value;
            recurrenceEditor.option(
              'value',
              `FREQ=MONTHLY;BYMONTHDAY=${dayOfMonth}`
            );
          }
          // Altrimenti, aggiorna solo la regola di ricorrenza salvata
          else {
            this.saveRecurrenceRule = args.value;
          }
        },
        onInitialized: (args: any) => {
          this.saveRecurrenceRule = 'FREQ=DAILY';
        },
      },
    };

    form.option('items', [
      searchFieldConfig,
      {
        dataField: 'description',
        editorType: 'dxTextArea',
        label: { text: 'Dettagli' },
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
          },
        },
      },
      {
        dataField: 'endDate',
        editorType: 'dxDateBox',
        label: { text: 'Data di fine' },
        editorOptions: {
          type: 'datetime',
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
      {
        dataField: 'categories',
        editorType: 'dxSelectBox',
        label: { text: 'Categorie' },
        editorOptions: {
          items: categories,
          displayExpr: 'text',
          valueExpr: 'id',
          onValueChanged: (e: any) => {
            this.selectedCategoria = e.value;
            form
              .getEditor('title')
              .option('dataSource', this.getAutocompleteSource(e.value));
          },
        },
      },
      switchConfig,
      recurrenceRuleConfig,
      {
        itemType: 'button',
        horizontalAlignment: 'right',
        buttonOptions: {
          text: 'Cancella',
          type: 'danger',
          onClick: () => {
            this.scheduler.instance.deleteAppointment(e.appointmentData);
          },
        },
      },
    ]);
  }

  getAutocompleteSource(categoria: string): string[] {
    if (categoria === 'sopralluogo') return this.nPreventiviArray;
    if (categoria === 'ordinario')
      return this.clientiArray
        .filter((c) => c.tipoCliente === 'O')
        .map((c) => `${c.numeroCliente} - ${c.nominativo}`);
    if (categoria === 'straordinario')
      return this.clientiArray
        .filter((c) => c.tipoCliente === 'S')
        .map((c) => `${c.numeroCliente} - ${c.nominativo}`);
    return [];
  }

  onAppointmentClick(e: any) {
    const data = e.appointmentData;
    const codice = data.title?.split(' - ')[0];
    const categoria = data.categories;

    if (categoria === 'sopralluogo') {
      this.router.navigate(['/editQuote', codice]); // preventivo
    } else if (categoria === 'ordinario' || categoria === 'straordinario') {
      this.router.navigate(['/editCustomer', codice]); // cliente
    }
  }

  onAppointmentAdding(e: AppointmentAddingEvent) {
    let body = {
      title: e.appointmentData['title'],
      startDate: e.appointmentData['startDate'],
      endDate: e.appointmentData['endDate'],
      recurrenceRule: this.saveRecurrenceRule,
      dayLong: e.appointmentData['dayLong'],
      description: e.appointmentData['description'],
      categories: e.appointmentData['categories'],
      recurrenceException: e.appointmentData['recurrenceException'],
    };
    const codice = body.title?.split(' - ')[0];
    const categoria = body.categories;
  
    // Obbligatori
    if (!body.title || !body.startDate || !body.endDate || !body.categories) {
      this.popup.text = 'Compilare tutti i campi obbligatori';
      this.popup.openPopup();
      this.ngOnInit();
      return;
    }
  
    // Verifica che il codice esista nel DB
    const codiceValido =
      (categoria === 'sopralluogo' &&
        this.nPreventiviArray.some(p =>
          this.normalize(p).startsWith(this.normalize(codice + ' -'))
        )) ||
      ((categoria === 'ordinario' || categoria === 'straordinario') &&
        this.clientiArray.some(
          c =>
            this.normalize(c.numeroCliente.toString()) === this.normalize(codice)
        )) ||
      categoria === 'altro';
  
    if (!codiceValido) {
      this.popup.text =
        'Codice non valido o non esistente per la categoria selezionata';
      this.popup.openPopup();
      e.cancel = true;
      this.scheduler.instance.hideAppointmentPopup();
      return;
    }
  
    this.http
      .post(this.globalService.url + 'appointments/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe(() => {
        this.ngOnInit();
        if (body.categories == 'sopralluogo') {
          this.http
            .post(
              this.globalService.url + 'appointments/sendInspectionConfirmation',
              body,
              { headers: this.globalService.headers, responseType: 'text' }
            )
            .subscribe((response) => {
              if (response == 'NO') {
                this.popup.text =
                  "Non è stato possibile inviare la mail di conferma dell'appuntamento perchè non è presente nessuna mail associata al preventivo";
                this.popup.openPopup();
              }
            });
        }
      });
  }

  onAppointmentUpdating(e: AppointmentUpdatingEvent) {
    let body = {
      id: e.oldData['id'],
      title: e.newData['title'],
      startDate: e.newData['startDate'],
      endDate: e.newData['endDate'],
      recurrenceRule: e.newData['recurrenceRule'],
      dayLong: e.newData['dayLong'],
      description: e.newData['description'],
      categories: e.newData['categories'],
      recurrenceException: e.newData['recurrenceException'],
    };
    if (
      body.title == undefined ||
      body.startDate == undefined ||
      body.endDate == undefined ||
      body.categories == undefined
    ) {
      this.popup.text = 'Compilare tutti i campi obbligatori';
      this.popup.openPopup();
      this.ngOnInit();
    } else {
      this.http
        .post(this.globalService.url + 'appointments/edit', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          this.ngOnInit();
          if (body.categories == 'sopralluogo') {
            this.http
              .post(
                this.globalService.url +
                  'appointments/sendInspectionConfirmation',
                body,
                {
                  headers: this.globalService.headers,
                  responseType: 'text',
                }
              )
              .subscribe((response) => {
                if (response == 'NO') {
                  this.popup.text =
                    "Non è stato possibile inviare la mail di conferma dell'appuntamento perchè non è presente nessuna mail associata al preventivo";
                  this.popup.openPopup();
                }
              });
          }
        });
    }
  }

  onAppointmentDeletedQuestion(e: AppointmentDeletedEvent) {
    const appointmentData = e.appointmentData;
    // Controlla se l'evento ha una regola di ricorrenza
    if (
      appointmentData.recurrenceRule &&
      appointmentData.recurrenceRule.trim() !== ''
    ) {
      // Se ha una regola di ricorrenza, chiama appointmentsDeleted
      this.appointmentsDeleted(e);
    } else {
      if (appointmentData.recurrenceRule == '') {
        this.appointmentsDeleted(e);
      } else {
        // Altrimenti, chiama appointmentDeleted
        this.appointmentDeleted(e);
      }
    }
  }

  appointmentDeleted(e: AppointmentDeletedEvent) {
    let body = {
      id: e.appointmentData['id'],
      occurrenceDate: this.convertDateToICSFormat(this.selectedDate),
    };
    this.http
      .post(
        this.globalService.url + 'appointments/deleteSingleOccurrence',
        body,
        {
          headers: this.globalService.headers,
          responseType: 'text',
        }
      )
      .subscribe((response) => {
        this.ngOnInit();
      });
  }

  appointmentsDeleted(e: AppointmentDeletedEvent) {
    let body = {
      id: e.appointmentData['id'],
    };
    this.http
      .post(this.globalService.url + 'appointments/delete', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {
        this.ngOnInit();
      });
  }

  onFilterChange(event: any) {
    const filterType = event.target.value;
    if (filterType === 'all') {
      this.filteredEvents = this.events;
    } else {
      this.filteredEvents = this.events.filter((event) => {
        return event.categories === filterType;
      });
    }
  }

  goBack() {
    this.router.navigateByUrl('homeAdmin');
  }
}
