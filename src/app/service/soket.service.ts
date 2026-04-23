import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';
import { TenantService } from './tenant.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor(
    private global: GlobalService,
    private tenantService: TenantService,
  ) {
    this.socket = io(global.url, {
      auth: { tenantId: this.tenantService.tenant },
      query: { tenantId: this.tenantService.tenant },
    });
  }

  // invia aggiornamenti al server
  emitUpdate(shift: any) {
    this.socket.emit('updateShift', {
      ...(shift || {}),
      tenantId: this.tenantService.tenant,
    });
  }

  // ascolta aggiornamenti da altri utenti
  onShiftUpdate(): Observable<any> {
    return new Observable((subscriber) => {
      const listener = (data: any) => subscriber.next(data);
      this.socket.on('shiftUpdated', listener);
      return () => {
        this.socket.off('shiftUpdated', listener);
      };
    });
  }
}
