import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-template-auth',
  imports: [RouterOutlet, RouterLink, MatIconModule],
  templateUrl: './template-auth.html',
  styleUrl: './template-auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateAuth {}
