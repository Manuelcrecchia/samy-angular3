import { Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  private isNative(): boolean {
    return Capacitor.getPlatform() !== 'web';
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

  async storeCredentials(email: string, password: string) {
    if (!this.isNative()) return; // ⛔ PREVIENE ERRORI SU WEB

    await NativeBiometric.setCredentials({
      server: 'sami-login',
      username: email,
      password: password,
    });
  }

  async getCredentials(): Promise<{ email: string; password: string } | null> {
    if (!this.isNative()) return null; // ⛔ PREVIENE ERRORI SU WEB

    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Autenticazione biometrica',
      });

      const creds = await NativeBiometric.getCredentials({
        server: 'sami-login',
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

  async deleteCredentials() {
    if (!this.isNative()) return; // ⛔ PREVIENE ERRORI SU WEB

    await NativeBiometric.deleteCredentials({
      server: 'sami-login',
    });
  }
}
