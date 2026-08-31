import { CustomerNotesComponent } from '../admin/customer-notes/customer-notes.component';
import { QuoteNotesComponent } from '../admin/quote-notes/quote-notes.component';

describe('Note attachment URL cache', () => {
  function componentWithSanitizer(componentType: any) {
    const component = Object.create(componentType.prototype) as any;
    const imageSanitizer = jasmine.createSpy('bypassSecurityTrustUrl')
      .and.callFake((source: string) => ({ kind: 'image', source }));
    const pdfSanitizer = jasmine.createSpy('bypassSecurityTrustResourceUrl')
      .and.callFake((source: string) => ({ kind: 'pdf', source }));
    component.sanitizer = {
      bypassSecurityTrustUrl: imageSanitizer,
      bypassSecurityTrustResourceUrl: pdfSanitizer,
    };
    return { component, imageSanitizer, pdfSanitizer };
  }

  for (const [label, componentType] of [
    ['cliente/dipendente', CustomerNotesComponent],
    ['preventivo', QuoteNotesComponent],
  ] as const) {
    it(`mantiene stabile l'URL immagine durante i controlli ripetuti (${label})`, () => {
      const { component, imageSanitizer } = componentWithSanitizer(componentType);
      const attachment = {
        nome: 'foto.jpg',
        mimeType: 'image/jpeg',
        previewUrl: 'blob:preview-stabile',
      };

      const first = component.getDataUrl(attachment);
      const second = component.getDataUrl(attachment);

      expect(second).toBe(first);
      expect(imageSanitizer).toHaveBeenCalledTimes(1);
    });

    it(`mantiene stabile la risorsa PDF durante i controlli ripetuti (${label})`, () => {
      const { component, pdfSanitizer } = componentWithSanitizer(componentType);
      const attachment = {
        nome: 'documento.pdf',
        mimeType: 'application/pdf',
        previewUrl: 'blob:pdf-stabile',
      };

      const first = component.getPdfResourceUrl(attachment);
      const second = component.getPdfResourceUrl(attachment);

      expect(second).toBe(first);
      expect(pdfSanitizer).toHaveBeenCalledTimes(1);
    });
  }
});
