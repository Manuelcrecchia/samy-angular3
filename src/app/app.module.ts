import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomerAreaComponent } from './componenti/login/customer-area/customer-area.component';
import { PrivateAreaComponent } from './componenti/login/private-area/private-area.component';
import { HomeAdminComponent } from './admin/homeadmin/homeadmin.component';
import { GlobalService } from './service/global.service';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UserSettingsComponent } from './admin/user-settings/user-settings.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatMenuModule} from '@angular/material/menu';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EmployeesSettingsComponent } from './admin/employees-settings/employees-settings.component';
import { HomesitoComponent } from './componenti/sito/homesito/homesito.component';
import { QuotesHomeComponent } from './admin/quotes-home/quotes-home.component';
import { AddQuoteComponent } from './admin/add-quote/add-quote.component';
import { EditQuoteComponent } from './admin/edit-quote/edit-quote.component';
import { CaricaFileComponent } from './admin/carica-file/carica-file.component';
import { FileDirective } from './file.directive';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MenageCustomerComponent } from './admin/menage-customer/menage-customer.component';
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
import { locale, loadMessages } from 'devextreme/localization';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import * as itMessages from 'devextreme/localization/messages/it.json';


import { MatDatepickerModule } from '@angular/material/datepicker';
import { PopUpComponent } from './admin/pop-up/pop-up.component';

loadMessages(itMessages);
locale('it');

@NgModule({
  declarations: [
    AppComponent,
    CustomerAreaComponent,
    PrivateAreaComponent,
    HomeAdminComponent,
    UserSettingsComponent,
    EmployeesSettingsComponent,
    HomesitoComponent,
    QuotesHomeComponent,
    AddQuoteComponent,
    EditQuoteComponent,
    CaricaFileComponent,
    FileDirective,
    MenageCustomerComponent,
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
    MatDatepickerModule,
    MatDialogModule
  ],
    providers: [
      GlobalService
    ],
    bootstrap: [AppComponent],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ]
  })
  // Remove the existing export statement for the AppModule class
  // export class AppModule { }
export class AppModule { }
export class YourModule { }
