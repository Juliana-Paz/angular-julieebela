import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Cupom } from '../../../../models/cupom.model';
import { CupomService } from '../../../../services/cupom.service';

interface ValidationError { field: string; message: string; }
interface BackendErrorResponse { errors?: ValidationError[]; }

@Component({
  selector: 'app-cupom-form',
  imports: [CommonModule, MatFormField, MatLabel, MatError, MatHint,
            ReactiveFormsModule, MatInputModule, MatButtonModule,
            MatIconModule, MatSlideToggleModule, RouterLink],
  templateUrl: './cupom-form.html',
  styleUrl: './cupom-form.css',
})
export class CupomForm implements OnInit {
  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cupomService: CupomService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
  ) {
    this.form = this.fb.group({
      id: [null],
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: [''],
      valorDesconto: [0, [Validators.required, Validators.min(0)]],
      percentual: [false],
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      ativo: [true],
    });
  }

  ngOnInit(): void {
    const cupom: Cupom = this.activatedRoute.snapshot.data['cupom'];
    if (cupom) this.form.patchValue(cupom);
  }

  onCodigoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    this.form.get('codigo')?.setValue(upper, { emitEvent: false });
    input.value = upper;
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cupom = this.form.value;
    const req = cupom.id ? this.cupomService.update(cupom) : this.cupomService.create(cupom);
    req.subscribe({
      next: () => { this.router.navigateByUrl('/adm/cupons'); this.exibirMensagem('Cupom salvo com sucesso!'); },
      error: (e) => {
        if (e.status === 400 && e.error?.errors) { this.processarErros(e.error); this.exibirMensagem('Corrija os erros indicados.'); }
        else this.exibirMensagem('Erro ao salvar cupom.');
      },
    });
  }

  excluir(): void {
    const { id } = this.form.value;
    if (!id || !confirm('Deseja realmente excluir este cupom?')) return;
    this.cupomService.delete(id).subscribe({
      next: () => { this.router.navigateByUrl('/adm/cupons'); this.exibirMensagem('Cupom excluído!'); },
      error: () => this.exibirMensagem('Erro ao excluir cupom.'),
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
