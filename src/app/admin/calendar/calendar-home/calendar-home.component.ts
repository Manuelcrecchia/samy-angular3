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
import { TenantService } from '../../../service/tenant.service';

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

  categories: { id: string; text: string }[] = [];

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
    private dialog: MatDialog,
    public tenantService: TenantService,
  ) {}

  ngOnInit() {
    this.categories = this.getCategoriesForTenant();

    this.saveRecurrenceRule = '';
    this.recurrenceRuleisVisible = false;

    this.http
      .get(this.globalService.url + 'appointments/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
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
              categories: this.getDefaultSopralluogoCategory(),
            },
            true,
          );
        }

        this.http
          .get(this.globalService.url + 'quotes/getAll', {
            headers: this.globalService.headers,
            responseType: 'text',
          })
          .subscribe({
            next: (quotesResponse) => {
            const data = JSON.parse(quotesResponse);

            this.nPreventiviArray = data
              .filter((item: any) => !item.complete)
              .map(
                (item: any) => `${item.numeroPreventivo} - ${item.nominativo}`,
              );

            this.descrizioneArray = data.map(
              (item: any) =>
                `Contatto: ${item.nominativo} Telefono: ${item.telefono}`,
            );

            this.categoriaArray = data.map((item: any) => item.tipoPreventivo);
            },
            error: (err) => {
              console.error('Errore caricamento:', err);
              alert('Errore durante il caricamento dei dati');
            },
          });
        },
        error: (err) => {
          console.error('Errore caricamento:', err);
          alert('Errore durante il caricamento dei dati');
        },
      });

    this.http
      .get(this.globalService.url + 'customers/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
          this.clientiArray = JSON.parse(response);
        },
        error: (err) => {
          console.error('Errore caricamento:', err);
          alert('Errore durante il caricamento dei dati');
        },
      });
  }

  private getCategoriesForTenant(): { id: string; text: string }[] {
    if (this.tenantService.isEmmeci) {
      return [
        { id: 'ordinario', text: 'Ordinario' },
        { id: 'sopralluogo', text: 'Sopralluogo' },
        { id: 'altro', text: 'Altro' },
      ];
    }

    return [
      { id: 'ordinario', text: 'Ordinario' },
      { id: 'straordinario', text: 'Straordinario' },
      { id: 'sopralluogo', text: 'Sopralluogo' },
      { id: 'lavoriSvolti', text: 'Lavori svolti' },
      { id: 'altro', text: 'Altro' },
    ];
  }

  private getDefaultSopralluogoCategory(): string {
    const found = this.categories.find((c) => c.id === 'sopralluogo');
    return found ? found.id : this.categories[0]?.id || 'altro';
  }

  private tenantSupportsStraordinario(): boolean {
    return this.categories.some((c) => c.id === 'straordinario');
  }

  private normalize(s: string): string {
    return (s || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }

  convertDateToICSFormat(date: Date) {
    const parsedDate = new Date(date);

    const year = parsedDate.getUTCFullYear();
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getUTCDate()).padStart(2, '0');
    const hours = String(parsedDate.getUTCHours()).padStart(2, '0');
    const minutes = String(parsedDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(parsedDate.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  getCategoryClass(category: string): string {
    const supported = [
      'sopralluogo',
      'ordinario',
      'straordinario',
      'lavoriSvolti',
      'altro',
    ];

    return supported.includes(category)
      ? `category-${category}`
      : 'category-default';
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
    this.updateNavigatorCaption();
  }

  onCurrentViewChange(event: any) {
    if (event.name === 'currentView' || event.name === 'currentDate') {
      this.currentView = event.value;
      this.updateNavigatorCaption();
    }
  }

  ngAfterViewInit() {
    this.updateNavigatorCaption();
  }

  onAppointmentFormOpening(e: any) {
    if (!this.canManageEvents) {
      e.cancel = true;
      alert('Non autorizzato: non hai il permesso per modificare gli eventi del calendario.');
      return;
    }

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
          ...this.clientiArray.map(
            (c) => `${c.numeroCliente} - ${c.nominativo}`,
          ),
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

          const idxPrev = this.nPreventiviArray.findIndex(
            (item) => this.normalize(item) === this.normalize(selectedValue),
          );

          if (idxPrev !== -1) {
            const descrizione = `Sopralluogo – ${this.descrizioneArray[idxPrev]}`;
            formCategoria.option('value', 'sopralluogo');
            form.getEditor('description').option('value', descrizione);
            return;
          }

          const cliente = this.clientiArray.find(
            (c) =>
              this.normalize(`${c.numeroCliente} - ${c.nominativo}`) ===
              this.normalize(selectedValue),
          );

          if (cliente) {
            let categoria = 'ordinario';

            if (
              this.tenantService.isSami &&
              this.tenantSupportsStraordinario()
            ) {
              categoria =
                cliente.tipoCliente === 'O' ? 'ordinario' : 'straordinario';
            }

            formCategoria.option('value', categoria);
            return;
          }

          formCategoria.option('value', null);
          form.getEditor('description').option('value', '');
        },
      },
      label: { text: 'Numero preventivo / cliente' },
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
          if (
            args.value != null &&
            args.value.startsWith('FREQ=WEEKLY;') &&
            (args.previousValue == null ||
              !args.previousValue.startsWith('FREQ=WEEKLY;'))
          ) {
            const dayOfWeek = this.selectedDate.getDay();
            const recurrenceEditor = args.component;
            this.saveRecurrenceRule = args.value;
            recurrenceEditor.option(
              'value',
              `FREQ=WEEKLY;BYDAY=${
                ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][dayOfWeek]
              }`,
            );
          } else if (
            args.value != null &&
            args.value.startsWith('FREQ=MONTHLY;') &&
            (args.previousValue == null ||
              !args.previousValue.startsWith('FREQ=MONTHLY;'))
          ) {
            const dayOfMonth = this.selectedDate.getDate();
            const recurrenceEditor = args.component;
            this.saveRecurrenceRule = args.value;
            recurrenceEditor.option(
              'value',
              `FREQ=MONTHLY;BYMONTHDAY=${dayOfMonth}`,
            );
          } else {
            this.saveRecurrenceRule = args.value;
          }
        },
        onInitialized: () => {
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
          onValueChanged: (evt: any) => {
            this.selectedCategoria = evt.value;
            form
              .getEditor('title')
              .option('dataSource', this.getAutocompleteSource(evt.value));
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
    if (categoria === 'sopralluogo') {
      return this.nPreventiviArray;
    }

    if (categoria === 'ordinario') {
      if (this.tenantService.isEmmeci) {
        return this.clientiArray.map(
          (c) => `${c.numeroCliente} - ${c.nominativo}`,
        );
      }

      return this.clientiArray
        .filter((c) => c.tipoCliente === 'O')
        .map((c) => `${c.numeroCliente} - ${c.nominativo}`);
    }

    if (categoria === 'straordinario' && this.tenantService.isSami) {
      return this.clientiArray
        .filter((c) => c.tipoCliente === 'S')
        .map((c) => `${c.numeroCliente} - ${c.nominativo}`);
    }

    return [];
  }

  onAppointmentClick(e: any) {
    const data = e.appointmentData;
    const codice = data.title?.split(' - ')[0];
    const categoria = data.categories;

    if (categoria === 'sopralluogo') {
      this.router.navigate(['/editQuote', codice]);
      return;
    }

    if (this.tenantService.isSami) {
      if (categoria === 'ordinario' || categoria === 'straordinario') {
        this.router.navigate(['/editCustomer', codice]);
      }
      return;
    }

    if (this.tenantService.isEmmeci) {
      if (categoria === 'ordinario') {
        this.router.navigate(['/editCustomer', codice]);
      }
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

    if (!body.title || !body.startDate || !body.endDate || !body.categories) {
      this.popup.text = 'Compilare tutti i campi obbligatori';
      this.popup.openPopup();
      this.ngOnInit();
      return;
    }

    const codiceValido =
      (categoria === 'sopralluogo' &&
        this.nPreventiviArray.some((p) =>
          this.normalize(p).startsWith(this.normalize(codice + ' -')),
        )) ||
      (categoria === 'ordinario' &&
        this.clientiArray.some(
          (c) =>
            this.normalize(c.numeroCliente.toString()) ===
            this.normalize(codice),
        )) ||
      (this.tenantService.isSami &&
        categoria === 'straordinario' &&
        this.clientiArray.some(
          (c) =>
            this.normalize(c.numeroCliente.toString()) ===
            this.normalize(codice),
        )) ||
      categoria === 'altro' ||
      categoria === 'lavoriSvolti';

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
      .subscribe({
        next: () => {
          this.ngOnInit();

          if (body.categories == 'sopralluogo') {
            this.http
              .post(
                this.globalService.url +
                  'appointments/sendInspectionConfirmation',
                body,
                { headers: this.globalService.headers, responseType: 'text' },
              )
              .subscribe({
                next: (response) => {
                  if (response == 'NO') {
                    this.popup.text =
                      "Non è stato possibile inviare la mail di conferma dell'appuntamento perchè non è presente nessuna mail associata al preventivo";
                    this.popup.openPopup();
                  }
                },
                error: (err) => {
                  console.error('Errore:', err);
                  alert(this.parseServerError(err));
                },
              });
          }
        },
        error: (err) => {
          console.error('Errore:', err);
          alert(this.parseServerError(err));
        },
      });
  }

  onAppointmentUpdating(e: AppointmentUpdatingEvent) {
    let body = {
      id: e.oldData['id'],
      title: e.newData['title'] ?? e.oldData['title'],
      startDate: e.newData['startDate'] ?? e.oldData['startDate'],
      endDate: e.newData['endDate'] ?? e.oldData['endDate'],
      recurrenceRule:
        e.newData['recurrenceRule'] ?? e.oldData['recurrenceRule'],
      dayLong: e.newData['dayLong'] ?? e.oldData['dayLong'],
      description: e.newData['description'] ?? e.oldData['description'],
      categories: e.newData['categories'] ?? e.oldData['categories'],
      recurrenceException:
        e.newData['recurrenceException'] ?? e.oldData['recurrenceException'],
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
      return;
    }

    this.http
      .post(this.globalService.url + 'appointments/edit', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
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
                },
              )
              .subscribe({
                next: (response) => {
                  if (response == 'NO') {
                    this.popup.text =
                      "Non è stato possibile inviare la mail di conferma dell'appuntamento perchè non è presente nessuna mail associata al preventivo";
                    this.popup.openPopup();
                  }
                },
                error: (err) => {
                  console.error('Errore:', err);
                  alert(this.parseServerError(err));
                },
              });
          }
        },
        error: (err) => {
          console.error('Errore:', err);
          alert(this.parseServerError(err));
        },
      });
  }

  onAppointmentDeletedQuestion(e: AppointmentDeletedEvent) {
    const appointmentData = e.appointmentData;

    if (
      appointmentData.recurrenceRule &&
      appointmentData.recurrenceRule.trim() !== ''
    ) {
      this.appointmentsDeleted(e);
    } else {
      if (appointmentData.recurrenceRule == '') {
        this.appointmentsDeleted(e);
      } else {
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
        },
      )
      .subscribe({
        next: () => {
          this.ngOnInit();
        },
        error: (err) => {
          console.error('Errore:', err);
          alert(this.parseServerError(err));
        },
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
      .subscribe({
        next: () => {
          this.ngOnInit();
        },
        error: (err) => {
          console.error('Errore:', err);
          alert(this.parseServerError(err));
        },
      });
  }

  onFilterChange(event: any) {
    const filterType = event.target.value;

    if (filterType === 'all') {
      this.filteredEvents = this.events;
    } else {
      this.filteredEvents = this.events.filter((ev) => {
        return ev.categories === filterType;
      });
    }
  }

  goBack() {
    this.router.navigateByUrl('homeAdmin');
  }

  get canManageEvents(): boolean {
    return this.globalService.hasPermission('CALENDAR_EVENT_MANAGE');
  }

  private parseServerError(err: any): string {
    if (err.status === 403) return 'Non autorizzato: permesso mancante per questa operazione.';
    try {
      const body = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
      if (body?.error) return body.error;
    } catch {}
    if (err.status === 0) return 'Impossibile connettersi al server';
    return 'Errore imprevisto. Riprova.';
  }
}
