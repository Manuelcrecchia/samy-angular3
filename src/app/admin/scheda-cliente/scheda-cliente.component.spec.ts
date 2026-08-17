import { SchedaClienteComponent } from './scheda-cliente.component';

describe('SchedaClienteComponent', () => {
  it('should be exported', () => {
    expect(SchedaClienteComponent).toBeTruthy();
  });

  it('mostra vuoti i campi personali di un cliente anonimizzato', () => {
    const globalService = {
      isAnonymizedRecord: (record: any) => Boolean(record?.anonymizedAt),
      getRecordDisplayName: () => 'dato che non deve comparire',
      getRecordValueForField: () => 'dato che non deve comparire',
    };
    const component = new SchedaClienteComponent(
      globalService as any,
      null as any,
      null as any,
      null as any,
    );
    component.cliente = {
      numeroCliente: 'X-000042',
      anonymizedAt: '2026-08-17T00:00:00.000Z',
    };

    expect(component.isAnonymized).toBeTrue();
    expect(component.getDisplayName()).toBe('');
    expect(component.formatFieldValue({ key: 'ragioneSociale' } as any)).toBe('');
  });
});
