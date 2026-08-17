import { PopupServiceService } from './popup-service.service';
import { of } from 'rxjs';

describe('PopupServiceService', () => {
  it('should be exported', () => {
    expect(PopupServiceService).toBeTruthy();
  });

  it('returns the result of the custom confirmation dialog', async () => {
    const dialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(true),
      }),
    };
    const service = new PopupServiceService(dialog as any);

    await expectAsync(service.confirm('Continuare?')).toBeResolvedTo(true);
    expect(dialog.open).toHaveBeenCalled();
    expect(dialog.open.calls.mostRecent().args[1].data.mode).toBe('confirm');
  });

  it('returns the value entered in the custom prompt', async () => {
    const dialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of('Nuovo valore'),
      }),
    };
    const service = new PopupServiceService(dialog as any);

    await expectAsync(service.prompt('Inserisci')).toBeResolvedTo('Nuovo valore');
    expect(dialog.open.calls.mostRecent().args[1].data.mode).toBe('prompt');
  });

  it('returns the third action from a three-choice dialog', async () => {
    const dialog = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of('tertiary'),
      }),
    };
    const service = new PopupServiceService(dialog as any);

    await expectAsync(service.chooseThree('Dettaglio', 'Verbale', {
      primaryLabel: 'Apri PDF',
      secondaryLabel: 'Scarica PDF',
      tertiaryLabel: 'Dati prova firma',
    })).toBeResolvedTo('tertiary');
    expect(dialog.open.calls.mostRecent().args[1].data.mode).toBe('choice-three');
  });
});
