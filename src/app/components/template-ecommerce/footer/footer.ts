import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ecommerce-footer',
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class EcommerceFooter {
  private readonly snack = inject(MatSnackBar);
  newsletterEmail = '';

  inscreverNewsletter(): void {
    if (!this.newsletterEmail) return;
    this.snack.open('Inscrito com sucesso!', '', { duration: 2500, verticalPosition: 'top' });
    this.newsletterEmail = '';
  }
}
