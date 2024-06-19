import { HttpClient } from '@angular/common/http';




import { Component } from '@angular/core';
@Component({
  selector: 'app-carica-file',
  templateUrl: './carica-file.component.html',
  styleUrls: ['./carica-file.component.css']
})
export class CaricaFileComponent {
  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file: File | null = fileInput.files ? fileInput.files[0] : null;

    if (file) {
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.http.post('http://your-server-url/upload', formData).subscribe(response => {
        // Gestisci la risposta del server qui
        console.log(response);
      });
    }
  }
}
