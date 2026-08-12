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
});
