import { DocumentManagerComponent } from './document-manager.component';

describe('DocumentManagerComponent', () => {
  it('should be exported', () => {
    expect(DocumentManagerComponent).toBeTruthy();
  });

  it('returns to the employee list from employee documents', () => {
    const component = Object.create(DocumentManagerComponent.prototype) as DocumentManagerComponent;
    const navigateByUrl = jasmine.createSpy('navigateByUrl');
    (component as any).router = { navigateByUrl };
    component.isCustomer = false;

    component.back();

    expect(navigateByUrl).toHaveBeenCalledOnceWith('/homeAdmin/gestioneemployees');
  });

  it('returns to the customer list from customer documents', () => {
    const component = Object.create(DocumentManagerComponent.prototype) as DocumentManagerComponent;
    const navigateByUrl = jasmine.createSpy('navigateByUrl');
    (component as any).router = { navigateByUrl };
    component.isCustomer = true;

    component.back();

    expect(navigateByUrl).toHaveBeenCalledOnceWith('/homeAdmin/listCustomer');
  });

  it('ignora una selezione file vuota senza mostrare avvisi', () => {
    const component = Object.create(DocumentManagerComponent.prototype) as DocumentManagerComponent;
    component.isUploading = false;
    const input = { files: [], value: 'stale' } as unknown as HTMLInputElement;
    const alertSpy = spyOn(window, 'alert');

    component.uploadFile({ target: input } as unknown as Event);

    expect(input.value).toBe('');
    expect(alertSpy).not.toHaveBeenCalled();
    expect(component.isUploading).toBeFalse();
  });

  it('azzera la ricerca quando apre una cartella trovata', () => {
    const component = Object.create(DocumentManagerComponent.prototype) as DocumentManagerComponent;
    component.selectedFolder = '';
    component.documentSearch = 'Contratti';
    spyOn<any>(component, 'refreshDirectory');

    component.selectFolder('Contratti');

    expect(component.selectedFolder).toBe('Contratti');
    expect(component.documentSearch).toBe('');
    expect((component as any).refreshDirectory).toHaveBeenCalled();
  });
});
