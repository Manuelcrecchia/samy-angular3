import { InternalDocumentsComponent } from './internal-documents.component';

describe('InternalDocumentsComponent', () => {
  it('should be exported', () => {
    expect(InternalDocumentsComponent).toBeTruthy();
  });

  it('ignora una selezione file vuota senza mostrare avvisi', () => {
    const component = new InternalDocumentsComponent(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const input = { files: [], value: 'stale' } as unknown as HTMLInputElement;
    const alertSpy = spyOn(window, 'alert');

    component.uploadFile({ target: input } as unknown as Event);

    expect(input.value).toBe('');
    expect(alertSpy).not.toHaveBeenCalled();
    expect(component.isUploading).toBeFalse();
  });

  it('azzera la ricerca quando apre una cartella trovata', () => {
    const component = new InternalDocumentsComponent(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    component.selectedFolder = '';
    component.documentSearch = 'Contratti';
    spyOn<any>(component, 'refreshDirectory');

    component.selectFolder('Contratti');

    expect(component.selectedFolder).toBe('Contratti');
    expect(component.documentSearch).toBe('');
    expect((component as any).refreshDirectory).toHaveBeenCalled();
  });
});
