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

  private resolveTenantFromQuery(): TenantId | null {
    if (typeof window === 'undefined') return null;

    const host = this.resolveHost();
    const isLocalHost =
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      host.includes('sami.local') ||
      host.includes('emmeci.local');

    if (!isLocalHost) {
      return null;
    }

    const tenant = new URLSearchParams(window.location.search)
      .get('tenant')
      ?.trim()
      .toLowerCase();

    if (tenant === 'sami' || tenant === 'emmeci') {
      return tenant;
    }

    return null;
  }

  get tenant(): TenantId {
    const queryTenant = this.resolveTenantFromQuery();
    if (queryTenant) {
      return queryTenant;
    }

    const host = this.resolveHost();

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
