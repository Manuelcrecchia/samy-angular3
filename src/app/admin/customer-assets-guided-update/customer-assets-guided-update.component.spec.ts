import { of } from 'rxjs';
import { CustomerAssetsGuidedUpdateComponent } from './customer-assets-guided-update.component';

describe('CustomerAssetsGuidedUpdateComponent', () => {
  function createComponent(query: Record<string, string> = {}): CustomerAssetsGuidedUpdateComponent {
    const http = { get: jasmine.createSpy('get').and.returnValue(of([])) };
    const global = {
      url: 'http://api/',
      loadTenantConfig: jasmine.createSpy('loadTenantConfig').and.returnValue(Promise.resolve()),
      getTenantCustomerAssetsConfig: () => ({
        types: [{
          key: 'water',
          label: 'Estintore ad acqua',
          fields: [
            { key: 'code', label: 'Codice', type: 'text', unique: true },
            { key: 'revision', label: 'Revisione', type: 'date', isDeadline: true },
            { key: 'test', label: 'Collaudo', type: 'date', isDeadline: true },
            { key: 'condition', label: 'Stato', type: 'select', options: ['Buono', 'Da sostituire'] },
            { key: 'report', label: 'Verbale', type: 'attachment' },
          ],
        }],
      }),
    };
    const router = {
      navigate: jasmine.createSpy('navigate').and.resolveTo(true),
      navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true),
    };
    const route = { snapshot: { queryParamMap: { get: (key: string) => query[key] || null } } };
    return new CustomerAssetsGuidedUpdateComponent(
      http as any,
      global as any,
      router as any,
      route as any,
      { confirm: jasmine.createSpy('confirm').and.resolveTo(true) } as any,
    );
  }

  function addAssets(component: CustomerAssetsGuidedUpdateComponent): void {
    component.assets = [{
      id: 1,
      numeroCliente: 'C1',
      customerLabel: 'Cliente Uno',
      typeKey: 'water',
      displayIdentifier: 'EST-01',
      customFields: { code: 'EST-01', revision: '2020-01-01', condition: 'Buono' },
      deadlines: [
        { id: 10, sourceFieldKey: 'revision', title: 'Revisione', dueDate: '2020-01-01', remindDays: 30 },
        { id: 11, sourceFieldKey: 'test', title: 'Collaudo', dueDate: '2099-01-01', remindDays: 30 },
      ],
    }, {
      id: 2,
      numeroCliente: 'C1',
      customerLabel: 'Cliente Uno',
      typeKey: 'water',
      displayIdentifier: 'EST-02',
      customFields: { code: 'EST-02' },
      deadlines: [],
    }] as any;
  }

  afterEach(() => sessionStorage.removeItem('mvanager-customer-asset-intervention-preparation'));

  it('offre tutti i campi configurati, non soltanto le scadenze', () => {
    const component = createComponent();
    expect(component.guidedFields('water').map((field) => field.key)).toEqual([
      'code', 'revision', 'test', 'condition', 'report',
    ]);
  });

  it('preseleziona le scadenze scadute quando si sceglie il cliente', () => {
    const component = createComponent();
    addAssets(component);
    component.selectCustomer('C1');

    expect(component.selectedPairs.has('1:revision')).toBeTrue();
    expect(component.selectedPairs.has('1:test')).toBeFalse();
    expect(component.selectedAssetCount).toBe(1);
    expect(component.visibleCustomerAssets.map((asset) => asset.id)).toEqual([1]);
  });

  it('permette di aggiungere un campo non collegato a una scadenza', () => {
    const component = createComponent();
    addAssets(component);
    component.selectCustomer('C1');
    const condition = component.guidedFields('water').find((field) => field.key === 'condition');
    const event = { preventDefault: jasmine.createSpy(), stopPropagation: jasmine.createSpy() } as any;

    component.togglePair(event, component.assets[0], condition);

    expect(component.selectedPairs.has('1:condition')).toBeTrue();
  });

  it('salva la preparazione completa e apre il calendario', async () => {
    const component = createComponent();
    addAssets(component);
    component.selectCustomer('C1');
    const condition = component.guidedFields('water').find((field) => field.key === 'condition');
    component.togglePair({ preventDefault() {}, stopPropagation() {} } as any, component.assets[0], condition);

    await component.continueToCalendar();

    const saved = JSON.parse(sessionStorage.getItem(component.preparationStorageKey) || '{}');
    expect(saved.mode).toBe('guided');
    expect(saved.items).toEqual([{ assetId: 1, fieldKeys: ['revision', 'condition'], deadlineIds: [10] }]);
    expect((component as any).router.navigate).toHaveBeenCalledWith(
      jasmine.any(Array),
      jasmine.objectContaining({ queryParams: jasmine.objectContaining({ assetPreparation: '1', interventionMode: 'guided' }) }),
    );
  });

  it('mantiene due presidi distinti nella preparazione inviata al calendario', async () => {
    const component = createComponent();
    addAssets(component);
    component.selectCustomer('C1');
    const condition = component.guidedFields('water').find((field) => field.key === 'condition');
    component.togglePair({ preventDefault() {}, stopPropagation() {} } as any, component.assets[1], condition);

    expect(component.selectedAssetCount).toBe(2);
    await component.continueToCalendar();

    const saved = JSON.parse(sessionStorage.getItem(component.preparationStorageKey) || '{}');
    expect(saved.items).toEqual([
      { assetId: 1, fieldKeys: ['revision'], deadlineIds: [10] },
      { assetId: 2, fieldKeys: ['condition'], deadlineIds: [] },
    ]);
    expect(saved.items.length).toBe(2);
  });

  it('riprende cliente e scadenza quando arriva dalla pianificazione', () => {
    const component = createComponent({ customerId: 'C1', deadlineIds: '11' });
    addAssets(component);
    (component as any).applyRouteSelection();

    expect(component.selectedCustomer).toBe('C1');
    expect(component.selectedPairs.has('1:test')).toBeTrue();
    expect(component.isAssetExpanded(1)).toBeTrue();
    expect(component.viewFilter).toBe('all');
  });
});
