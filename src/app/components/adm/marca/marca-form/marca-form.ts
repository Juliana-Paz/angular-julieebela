import { Component, OnInit } from '@angular/core';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Marca } from '../../../../models/marca.model';
import { MarcaService } from '../../../../services/marca.service';

interface ValidationError { field: string; message: string; }
interface BackendErrorResponse { errors?: ValidationError[]; }

@Component({
  selector: 'app-marca-form',
  imports: [MatFormField, MatLabel, MatError, ReactiveFormsModule,
            MatInputModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './marca-form.html',
  styleUrl: './marca-form.css',
})
export class MarcaForm implements OnInit {
  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private marcaService: MarcaService,
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
    const marca: Marca = this.activatedRoute.snapshot.data['marca'];
    if (marca) this.form.patchValue(marca);
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const marca = this.form.value;
    const req = marca.id ? this.marcaService.update(marca) : this.marcaService.create(marca);
    req.subscribe({
      next: () => { this.router.navigateByUrl('/adm/marcas'); this.exibirMensagem('Marca salva com sucesso!'); },
      error: (e) => {
        if (e.status === 400 && e.error?.errors) { this.processarErros(e.error); this.exibirMensagem('Corrija os erros indicados.'); }
        else this.exibirMensagem('Erro ao salvar marca.');
      },
    });
  }

  excluir(): void {
    const { id } = this.form.value;
    if (!id || !confirm('Deseja realmente excluir esta marca?')) return;
    this.marcaService.delete(id).subscribe({
      next: () => { this.router.navigateByUrl('/adm/marcas'); this.exibirMensagem('Marca excluída!'); },
      error: () => this.exibirMensagem('Erro ao excluir marca.'),
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
