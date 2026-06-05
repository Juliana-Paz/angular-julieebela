import { Component, OnInit } from '@angular/core';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Categoria } from '../../../../models/categoria.model';
import { CategoriaService } from '../../../../services/categoria.service';

interface ValidationError { field: string; message: string; }
interface BackendErrorResponse { errors?: ValidationError[]; }

@Component({
  selector: 'app-categoria-form',
  imports: [MatFormField, MatLabel, MatError, ReactiveFormsModule,
            MatInputModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css',
})
export class CategoriaForm implements OnInit {
  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: [''],
    });
  }

  ngOnInit(): void {
    const categoria: Categoria = this.activatedRoute.snapshot.data['categoria'];
    if (categoria) {
      this.form.patchValue(categoria);
    }
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const categoria = this.form.value;
    const req = categoria.id
      ? this.categoriaService.update(categoria)
      : this.categoriaService.create(categoria);

    req.subscribe({
      next: () => {
        this.router.navigateByUrl('/adm/categorias');
        this.exibirMensagem('Categoria salva com sucesso!');
      },
      error: (erro) => {
        if (erro.status === 400 && erro.error?.errors) {
          this.processarErrosValidacao(erro.error as BackendErrorResponse);
          this.exibirMensagem('Corrija os erros de validação indicados.');
        } else {
          this.exibirMensagem('Erro ao salvar categoria. Tente novamente.');
        }
      },
    });
  }

  excluir(): void {
    const { id } = this.form.value;
    if (!id || !confirm('Deseja realmente excluir esta categoria?')) return;
    this.categoriaService.delete(id).subscribe({
      next: () => {
        this.router.navigateByUrl('/adm/categorias');
        this.exibirMensagem('Categoria excluída com sucesso!');
      },
      error: () => this.exibirMensagem('Erro ao excluir categoria.'),
    });
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', { duration: 2500, horizontalPosition: 'center', verticalPosition: 'top' });
  }

  private processarErrosValidacao(response: BackendErrorResponse): void {
    if (!response.errors?.length) return;
    Object.keys(this.form.controls).forEach(k => this.form.get(k)?.setErrors(null));
    response.errors.forEach(e => {
      const ctrl = this.form.get(e.field);
      if (ctrl) { ctrl.setErrors({ backendError: e.message }); ctrl.markAsTouched(); }
    });
  }
}
