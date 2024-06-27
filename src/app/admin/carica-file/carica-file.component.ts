import { HttpClient,HttpEventType } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';




@Component({
  selector: 'app-carica-file',
  templateUrl: './carica-file.component.html',
  styleUrls: ['./carica-file.component.css']
})


export class CaricaFileComponent {
  title: string = '';
  user: string = '';
  error: string = '';
  toUpload: any[] = []; // Aggiungi questa linea
    progress: number = 0;
    @ViewChild('fileInput') fileInput!: ElementRef;

  onFileDropped(event: DragEvent) {
    let files = event.dataTransfer?.files;
    if (files) {
      this.onFileSelected(files);
    }
  }

  onFileSelected(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.toUpload.push(files.item(i));
    }
  }

  send(): void {
    this.progress = 0;
    let formData = new FormData();
    formData.append('file', this.toUpload[0], this.toUpload[0].name);
    formData.append('request', 'UPLOAD');
    this.error = '';
    this.http.post('http://localhost:4200/upload.nodejs', formData, {
      reportProgress: true,
      observe: 'events'
    })
    .subscribe(event => {
      if (event.type == HttpEventType.UploadProgress) {
        if (event.total !== undefined) {
          this.progress = Number(Math.round(100 * event.loaded / event.total ));
        }
      } else if (event.type === HttpEventType.Response) {
        let res = event.body as any[]; // Add type assertion here
        if (res[0] =="OK") {
          this.toUpload = new Array();
          this.error = 'file caricato';
        }
        else {
          this.error = res[1];
        }

      }
    });
    // here you should implement the logic to send the files to the server
  }


  constructor(public route: ActivatedRoute, public http: HttpClient) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.title = params.get('id') ?? '';
      this.user = params.get('user') ?? '';
    });
  }

  ondrag(event: DragEvent) {
    this.progress = 100;
    this.error = 'file caricato';
    let files = event.dataTransfer?.files;
    if (files && files.length > 1) {
    } else {
      let file = files ? files[0] : null;
      if (file) {
        let fileName = file.name;
        let split= fileName.split('.');
        let ext = split[split.length-1].toLowerCase();
        if (ext != "pdf") {
          this.error = "solo pdf";
        } else {
          if (file.size > 7800000) {
            this.error = "file troppo grande max (78 mega)";
          }
          else {
            this.toUpload.push(file);
            this.error = '';
          }
        }
      }
    }
  }
}


