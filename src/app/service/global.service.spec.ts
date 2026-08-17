import { GlobalService } from './global.service';

describe('GlobalService', () => {
  it('should be exported', () => {
    expect(GlobalService).toBeTruthy();
  });

  it('uses the tenant feature catalog as the source of truth for invoices', () => {
    const service = new GlobalService(
      { token: '', userCode: '', permissions: [] } as any,
      { tenant: 'test', tenantLabel: 'Test' } as any,
      {} as any,
    );
    (service as any).tenantConfig = { features: ['invoices'] };

    expect(service.isFeatureAvailableInApp('invoices')).toBeTrue();
  });

  it('still hides invoices when the tenant has not purchased the feature', () => {
    const service = new GlobalService(
      { token: '', userCode: '', permissions: [] } as any,
      { tenant: 'test', tenantLabel: 'Test' } as any,
      {} as any,
    );
    (service as any).tenantConfig = { features: ['customers'] };

    expect(service.isFeatureAvailableInApp('invoices')).toBeFalse();
  });

  it('riconosce clienti e preventivi anonimizzati senza esporre valori mappati', () => {
    const service = new GlobalService(
      { token: '', userCode: '', permissions: [] } as any,
      { tenant: 'test', tenantLabel: 'Test' } as any,
      {} as any,
    );
    const anonymousCustomer = {
      numeroCliente: 'X-000042',
      ragioneSociale: 'dato che non deve comparire',
    };

    expect(service.isAnonymizedRecord(anonymousCustomer)).toBeTrue();
    expect(service.isAnonymizedRecord({ customerId: 'X-000043' })).toBeTrue();
    expect(service.isAnonymizedRecord({ customer: { numeroCliente: 'X-000044' } })).toBeTrue();
    expect(service.isAnonymizedRecord({ entityType: 'customer', targetKey: 'X-000045' })).toBeTrue();
    expect(service.isAnonymizedRecord({ numeroCliente: '42' })).toBeFalse();
    expect(service.getRecordDisplayName('customer', anonymousCustomer)).toBe('');
  });
});
