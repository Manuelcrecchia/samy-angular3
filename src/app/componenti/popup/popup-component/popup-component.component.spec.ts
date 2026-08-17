import { PopupComponentComponent } from './popup-component.component';

describe('PopupComponentComponent', () => {
  it('should be exported', () => {
    expect(PopupComponentComponent).toBeTruthy();
  });

  it('closes a prompt with the entered value', () => {
    const dialogRef = { close: jasmine.createSpy('close') };
    const component = new PopupComponentComponent({
      mode: 'prompt',
      title: 'Titolo',
      message: 'Messaggio',
      type: 'info',
      confirmLabel: 'Continua',
      inputValue: 'Valore iniziale',
    }, dialogRef as any);

    component.inputValue = 'Valore aggiornato';
    component.confirm();

    expect(dialogRef.close).toHaveBeenCalledWith('Valore aggiornato');
  });

  it('closes a confirmation as cancelled without applying changes', () => {
    const dialogRef = { close: jasmine.createSpy('close') };
    const component = new PopupComponentComponent({
      mode: 'confirm',
      title: 'Titolo',
      message: 'Messaggio',
      type: 'warning',
      confirmLabel: 'Conferma',
      cancelLabel: 'Annulla',
    }, dialogRef as any);

    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith(null);
  });

  it('returns the third action from a three-choice dialog', () => {
    const dialogRef = { close: jasmine.createSpy('close') };
    const component = new PopupComponentComponent({
      mode: 'choice-three',
      title: 'Verbale firmato',
      message: 'Dettaglio',
      type: 'info',
      confirmLabel: 'Apri PDF',
      secondaryLabel: 'Scarica PDF',
      tertiaryLabel: 'Dati prova firma',
      cancelLabel: 'Chiudi',
    }, dialogRef as any);

    component.chooseTertiary();

    expect(dialogRef.close).toHaveBeenCalledWith('tertiary');
  });
});
