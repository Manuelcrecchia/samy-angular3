import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../service/global.service';

export interface InternalDoc {
  name: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class InternalDocumentsService {
  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
  ) {}

  private base = `${this.globalService.url}admin/internal-documents`;

  list() {
    return this.http.get<InternalDoc[]>(this.base);
  }

  upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.base}/upload`, form);
  }

  download(name: string) {
    window.open(`${this.base}/download/${encodeURIComponent(name)}`, '_blank');
  }

  delete(name: string) {
    return this.http.delete(`${this.base}/${encodeURIComponent(name)}`);
    // se sul backend hai POST /delete:
    // return this.http.post(`${this.base}/delete`, { name });
  }
}
