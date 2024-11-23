import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-question-popup',
  templateUrl: './question-popup.component.html',
  styleUrl: './question-popup.component.css'
})
export class QuestionPopupComponent {
  constructor(public dialogRef: MatDialogRef<QuestionPopupComponent>) {}

     onConfirm(): void {
       this.dialogRef.close(true); // Chiude il dialogo e restituisce true
     }

     onCancel(): void {
       this.dialogRef.close(false); // Chiude il dialogo e restituisce false
     }

}
