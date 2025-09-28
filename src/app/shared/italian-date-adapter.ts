import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class ItalianDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
    // 👇 forza lunedì come primo giorno
    return 1;
  }
}
