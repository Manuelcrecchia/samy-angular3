import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { LOCALE_ID } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrivateAreaComponent } from './componenti/login/private-area/private-area.component';
import { HomeAdminComponent } from './admin/homeadmin/homeadmin.component';
import { GlobalService } from './service/global.service';
import { PreventiviSitoComponent } from './componenti/sito/preventivi/preventivi-sito.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  MatButtonToggleGroup,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UserSettingsComponent } from './admin/user-settings/user-settings.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomesitoComponent } from './componenti/sito/homesito/homesito.component';
import { QuotesHomeComponent } from './admin/quotes-home/quotes-home.component';
import { AddQuoteComponent } from './admin/add-quote/add-quote.component';
import { EditQuoteComponent } from './admin/edit-quote/edit-quote.component';
import { FileDirective } from './file.directive';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AddCustomerComponent } from './admin/add-customer/add-customer.component';
import { ListCustomerComponent } from './admin/list-customer/list-customer.component';
import { SanificazioniComponent } from './componenti/sito/sanificazioni/sanificazioni.component';
import { UfficiComponent } from './componenti/sito/uffici/uffici.component';
import { Condomini1Component } from './componenti/condomini1/condomini1.component';
import { PopupComponentComponent } from './componenti/popup/popup-component/popup-component.component';
import { DxSchedulerModule } from 'devextreme-angular';
import { PalestraComponent } from './componenti/sito/palestra/palestra.component';
import { StraordinariaComponent } from './componenti/sito/straordinaria/straordinaria.component';
import { DomesticaComponent } from './componenti/sito/domestica/domestica.component';
import { PassworddimenticataComponent } from './componenti/login/passworddimenticata/passworddimenticata.component';
import { CambiapasswordComponent } from './componenti/admin/cambiapassword/cambiapassword.component';
import { CalendarHomeComponent } from './admin/calendar/calendar-home/calendar-home.component';
import { DxButtonModule } from 'devextreme-angular';
import { DxAutocompleteModule } from 'devextreme-angular';
import { locale, loadMessages } from 'devextreme/localization';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common'; // IMPORTA QUESTO
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';

import * as itMessages from 'devextreme/localization/messages/it.json';

import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PopUpComponent } from './admin/pop-up/pop-up.component';
import { QuestionPopupComponent } from './componenti/popup/question-popup/question-popup.component';
import { PrivacyComponent } from './sito/privacy/privacy.component';
import { PreventiviComponent } from './sito/preventivi/preventivi.component';
import { NavbarComponent } from './sito/navbar/navbar.component';
import { GestioneEmployeesComponent } from './admin/gestione-employees/gestione-employees.component';
import { SettingsEmployeesComponent } from './admin/settings-employees/settings-employees.component';
import { DocumentManagerComponent } from './admin/document-manager/document-manager.component';
import { ViewPdfComponent } from './admin/view-pdf/view-pdf.component';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { ItalianDateAdapter } from './shared/italian-date-adapter';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './auth-interceptor.service';
import { BlogComponent } from './componenti/sito/blog/blog.component';
import { ConvenzioniPromozioniComponent } from './componenti/sito/convenzioni-promozioni/convenzioni-promozioni.component';
import { EditCustomerComponent } from './admin/edit-customer/edit-customer.component';
import { SchedaClienteComponent } from './admin/scheda-cliente/scheda-cliente.component';
import { ShiftHomeComponent } from './admin/shift-home/shift-home.component';
import { CreateShiftComponent } from './admin/create-shift/create-shift.component';
import { AssignDialogComponent } from './admin/assign-dialog/assign-dialog.component';
import { GestionePermessiComponent } from './admin/gestione-permessi/gestione-permessi.component';
import { RiepilogoPresenzeComponent } from './admin/riepilogo-presenze/riepilogo-presenze.component';
import { TimbratureHomeComponent } from './admin/timbrature-home/timbrature-home.component';
import { TimbratureDettaglioComponent } from './admin/timbrature-dettaglio/timbrature-dettaglio.component';
import { CustomModalComponent } from './admin/timbrature-dettaglio/custom-modal/custom-modal.component';
import { GestioneAssenzeComponent } from './admin/gestione-assenze/gestione-assenze.component';
import { LeaveSettingsComponent } from './admin/leave-settings/leave-settings.component';

loadMessages(itMessages);
locale('it');
registerLocaleData(localeIt);
loadMessages(itMessages);

@NgModule({
  declarations: [
    AppComponent,
    PrivateAreaComponent,
    HomeAdminComponent,
    UserSettingsComponent,
    HomesitoComponent,
    QuotesHomeComponent,
    AddQuoteComponent,
    EditQuoteComponent,
    FileDirective,
    AddCustomerComponent,
    ListCustomerComponent,
    SanificazioniComponent,
    UfficiComponent,
    Condomini1Component,
    PopupComponentComponent,
    PalestraComponent,
    StraordinariaComponent,
    DomesticaComponent,
    PassworddimenticataComponent,
    CambiapasswordComponent,
    CalendarHomeComponent,
    PopUpComponent,
    QuestionPopupComponent,
    PrivacyComponent,
    PreventiviComponent,
    NavbarComponent,
    GestioneEmployeesComponent,
    SettingsEmployeesComponent,
    ViewPdfComponent,
    DocumentManagerComponent,
    BlogComponent,
    ConvenzioniPromozioniComponent,
    EditCustomerComponent,
    SchedaClienteComponent,
    ShiftHomeComponent,
    CreateShiftComponent,
    AssignDialogComponent,
    GestionePermessiComponent,
    RiepilogoPresenzeComponent,
    TimbratureHomeComponent,
    TimbratureDettaglioComponent,
    GestioneAssenzeComponent,
    PreventiviSitoComponent,
    LeaveSettingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSlideToggleModule,
    MatButtonToggleGroup,
    HttpClientModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
    MatButtonToggleModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatGridListModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatTabsModule,
    MatSidenavModule,
    MatMenuModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatExpansionModule,
    NgxExtendedPdfViewerModule,
    DxButtonModule,
    DxSchedulerModule,
    DxAutocompleteModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatDialogModule,
    CommonModule,
    DragDropModule,
    NgbModalModule,
    CustomModalComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'it-IT' },
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: DateAdapter, useClass: ItalianDateAdapter },
    GlobalService,
    DatePipe,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
// Remove the existing export statement for the AppModule class
// export class AppModule { }
export class AppModule {}
export class YourModule {}
