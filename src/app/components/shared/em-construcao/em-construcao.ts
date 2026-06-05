import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-em-construcao',
  imports: [MatIconModule],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem;gap:1rem;color:#888">
      <mat-icon style="font-size:4rem;width:4rem;height:4rem">construction</mat-icon>
      <h2 style="margin:0">Em construção</h2>
      <p style="margin:0">Este componente será implementado em breve.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmConstrucao {}
