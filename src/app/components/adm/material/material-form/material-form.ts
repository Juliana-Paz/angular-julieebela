import { Component, OnInit } from '@angular/core';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Material } from '../../../../models/material.model';
import { MaterialService } from '../../../../services/material.service';

interface ValidationError { field: string; message: string; }
interface BackendErrorResponse { errors?: ValidationError[]; }

@Component({
  selector: 'app-material-form',
  imports: [MatFormField, MatLabel, MatError, ReactiveFormsModule,
            MatInputModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './material-form.html',
  styleUrl: './material-form.css',
})
export class MaterialForm implements OnInit {
  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
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
    const material: Material = this.activatedRoute.snapshot.data['material'];
    if (material) this.form.patchValue(material);
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const material = this.form.value;
    const req = material.id ? this.materialService.update(material) : this.materialService.create(material);
    req.subscribe({
      next: () => { this.router.navigateByUrl('/adm/materiais'); this.exibirMensagem('Material salvo com sucesso!'); },
      error: (e) => {
        if (e.status === 400 && e.error?.errors) { this.processarErros(e.error); this.exibirMensagem('Corrija os erros indicados.'); }
        else this.exibirMensagem('Erro ao salvar material.');
      },
    });
  }

  excluir(): void {
    const { id } = this.form.value;
    if (!id || !confirm('Deseja realmente excluir este material?')) return;
    this.materialService.delete(id).subscribe({
      next: () => { this.router.navigateByUrl('/adm/materiais'); this.exibirMensagem('Material excluído!'); },
      error: () => this.exibirMensagem('Erro ao excluir material.'),
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
