import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { AlunoService } from '../../../../services/aluno.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Aluno } from '../../../../models/aluno.model';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-aluno-form',
  imports:
    [MatCardModule,
      MatFormField,
      MatLabel,
      MatButtonModule,
      ReactiveFormsModule,
      MatInputModule,
      MatIconModule,
      CommonModule,
      MatDatepickerModule,
      MatNativeDateModule,
      RouterLink],
  templateUrl: './aluno-form.html',
  styleUrl: './aluno-form.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
})
export class AlunoForm implements OnInit {
  readonly form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private alunoService: AlunoService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(2)]],
      sobrenome: ['', [Validators.required, Validators.minLength(2)]],
      dataNascimento: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefones: this.fb.array([])
    });
  }

  get telefones(): FormArray {
    return this.form.get('telefones') as FormArray;
  }

  ngOnInit(): void {
    const aluno: Aluno = this.activatedRoute.snapshot.data['aluno'];

    if (aluno) {
      this.form.patchValue({
        id: aluno.id,
        nome: aluno.nome,
        sobrenome: aluno.sobrenome,
        dataNascimento: aluno.dataNascimento,
        cpf: this.formatCpf(aluno.cpf ?? ''),
        email: aluno.email
      });

      if (aluno.telefones && aluno.telefones.length > 0) {
        aluno.telefones.forEach(tel => {
          this.adicionarTelefone(tel.codigoArea, tel.numero);
        });
      }
    }
  }

  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedCpf = this.formatCpf(input.value);

    input.value = formattedCpf;
    this.form.get('cpf')?.setValue(formattedCpf, { emitEvent: false });
  }

  private formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  }

  adicionarTelefone(codigoArea: string = '', numero: string = ''): void {
    const telefoneFG = this.fb.group({
      codigoArea: [codigoArea, [Validators.required, Validators.pattern(/^\d{2,3}$/)]],
      numero: [numero, [Validators.required, Validators.pattern(/^\d{8,9}$/)]]
    });
    this.telefones.push(telefoneFG);
  }

  removerTelefone(index: number): void {
    this.telefones.removeAt(index);
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const aluno = this.form.value;

    let resultado = (aluno.id) ? this.alunoService.update(aluno) : this.alunoService.create(aluno);

    resultado.subscribe(
      () => {
        this.snack.open('Aluno salvo com sucesso', 'Fechar', { duration: 2000 });
        this.router.navigate(['/alunos']);
      },
      (erro) => {
        this.snack.open('Erro ao salvar aluno', 'Fechar', { duration: 2000 });
      }
    );
  }

  excluir() {
    if (!this.form.value.id) return;

    this.alunoService.delete(this.form.value.id).subscribe(
      () => {
        this.snack.open('Aluno deletado com sucesso', 'Fechar', { duration: 2000 });
        this.router.navigate(['/alunos']);
      },
      (erro) => {
        this.snack.open('Erro ao deletar aluno', 'Fechar', { duration: 2000 });
      }
    );
  }
}
