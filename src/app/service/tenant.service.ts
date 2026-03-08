import { Injectable } from '@angular/core';

export type TenantId = 'sami' | 'emmeci';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private resolveHost(): string {
    if (typeof window === 'undefined') return '';
    return window.location.hostname.toLowerCase();
  }

  get tenant(): TenantId {
    const host = this.resolveHost();
    console.log(host.toString());

    if (
      host.includes('emmeci') ||
      host.includes('mcmoving') ||
      host.includes('moving')
    ) {
      return 'emmeci';
    }

    return 'sami';
  }

  get isSami(): boolean {
    return this.tenant === 'sami';
  }

  get isEmmeci(): boolean {
    return this.tenant === 'emmeci';
  }
}
