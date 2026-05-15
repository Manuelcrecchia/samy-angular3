import { Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';
import { TenantId, TenantService } from './tenant.service';

@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  constructor(private tenantService: TenantService) {}

  private isNative(): boolean {
    return Capacitor.getPlatform() !== 'web';
  }

  private getServerKey(tenant: TenantId): string {
    return `mvanager-login-${tenant}`;
  }

  async isAvailable(): Promise<boolean> {
    // ❌ Su web → NON è disponibile
    if (!this.isNative()) return false;

    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch {
      return false;
    }
  }

  async storeCredentials(email: string, password: string, tenant?: TenantId) {
    if (!this.isNative()) return; // ⛔ PREVIENE ERRORI SU WEB

    const resolvedTenant = tenant || this.tenantService.tenant;

    await NativeBiometric.setCredentials({
      server: this.getServerKey(resolvedTenant),
      username: email,
      password: password,
    });
  }

  async getCredentials(
    tenant?: TenantId,
  ): Promise<{ email: string; password: string } | null> {
    if (!this.isNative()) return null; // ⛔ PREVIENE ERRORI SU WEB

    const resolvedTenant = tenant || this.tenantService.selectedTenant;
    if (!resolvedTenant) return null;

    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Autenticazione biometrica',
      });

      const creds = await NativeBiometric.getCredentials({
        server: this.getServerKey(resolvedTenant),
      });

      return {
        email: creds.username,
        password: creds.password,
      };
    } catch (err) {
      console.log('❌ Biometria fallita', err);
      return null;
    }
  }

  async deleteCredentials(tenant?: TenantId) {
    if (!this.isNative()) return; // ⛔ PREVIENE ERRORI SU WEB

    const resolvedTenant = tenant || this.tenantService.selectedTenant;
    if (!resolvedTenant) return;

    await NativeBiometric.deleteCredentials({
      server: this.getServerKey(resolvedTenant),
    });
  }
}
