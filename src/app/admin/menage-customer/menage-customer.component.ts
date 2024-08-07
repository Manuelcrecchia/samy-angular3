import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import {CustomerModelService} from '../../service/customer-model.service'
import { Injectable } from '@angular/core';
import {  OnInit } from '@angular/core';




@Injectable({
  providedIn: 'root'
})


@Component({
  selector: 'app-menage-customer',
  templateUrl: './menage-customer.component.html',
  styleUrls: ['./menage-customer.component.css']
})
export class MenageCustomerComponent {

  constructor(public customerModelService: CustomerModelService, private http: HttpClient, private globalService: GlobalService, private router: Router) {}




ngOnInit() {
  this.customerModelService = new CustomerModelService();
}



  // Dichiarazione di variabili per i dati
     servizi = {
servizi: ['Servizi1', 'Servizio 2', 'Servizio 3'], // Esempio di array servizi
interventi: ['Interventi1', 'Intervento 2'] // Esempio di array interventi

};

// Altri metodi o variabili se necessario





  conferm(numeroPreventivo: string){
    const body = { numeroPreventivo: numeroPreventivo };

    this.http
    .post(
      this.globalService.url + 'quotes/conferm',
      body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response)=>{
        if(response == 'Unauthorized') {
          this.router.navigateByUrl('/')
        }
      })

      }



      // blocco note


    //   document.getElementById('saveNote').addEventListener('click', function() {
    //     const noteText = document.getElementById('noteInput').value;
    //     if (noteText.trim() !== '') {
    //         // Qui dovresti inviare la nota al server per salvarla
    //         // Questo esempio aggiunge semplicemente la nota all'HTML per visualizzazione
    //         const noteElement = document.createElement('div');
    //         noteElement.classList.add('note');
    //         noteElement.textContent = noteText;
    //         document.getElementById('notesList').appendChild(noteElement);
    //         document.getElementById('noteInput').value = ''; // Pulisci l'input dopo il salvataggio
    //     } else {
    //         alert('La nota non può essere vuota!');
    //     }
    // });
  }



