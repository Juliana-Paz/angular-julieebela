import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Cor } from '../../../../models/cor.model';
import { CorService } from '../../../../services/cor.service';

interface ValidationError { field: string; message: string; }
interface BackendErrorResponse { errors?: ValidationError[]; }

@Component({
  selector: 'app-cor-form',
  imports: [CommonModule, MatFormField, MatLabel, MatError, MatSuffix,
            ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './cor-form.html',
  styleUrl: './cor-form.css',
})
export class CorForm implements OnInit {
  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private corService: CorService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(2)]],
      hexadecimal: ['#000000', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
    });
  }

  ngOnInit(): void {
    const cor: Cor = this.activatedRoute.snapshot.data['cor'];
    if (cor) this.form.patchValue(cor);
  }

  get hexPreview(): string {
    const v = this.form.get('hexadecimal')?.value ?? '';
    return /^#[0-9A-Fa-f]{6}$/.test(v) ? v : '#cccccc';
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cor = this.form.value;
    const req = cor.id ? this.corService.update(cor) : this.corService.create(cor);
    req.subscribe({
      next: () => { this.router.navigateByUrl('/adm/cores'); this.exibirMensagem('Cor salva com sucesso!'); },
      error: (e) => {
        if (e.status === 400 && e.error?.errors) { this.processarErros(e.error); this.exibirMensagem('Corrija os erros indicados.'); }
        else this.exibirMensagem('Erro ao salvar cor.');
      },
    });
  }

  excluir(): void {
    const { id } = this.form.value;
    if (!id || !confirm('Deseja realmente excluir esta cor?')) return;
    this.corService.delete(id).subscribe({
      next: () => { this.router.navigateByUrl('/adm/cores'); this.exibirMensagem('Cor excluída!'); },
      error: () => this.exibirMensagem('Erro ao excluir cor.'),
    });
  }

  exibirMensagem(msg: string): void {
    this.snack.open(msg, 'OK', { duration: 2500, horizontalPosition: 'center', verticalPosition: 'top' });
  }

  private processarErros(response: BackendErrorResponse): void {
    if (!response.errors?.length) return;
    Object.keys(this.form.controls).forEach(k => this.form.get(k)?.setErrors(null));
    response.errors.forEach(e => {
      const ctrl = this.form.get(e.field);
      if (ctrl) { ctrl.setErrors({ backendError: e.message }); ctrl.markAsTouched(); }
    });
  }
}
