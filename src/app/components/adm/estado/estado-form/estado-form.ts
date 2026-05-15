import { Component, OnInit } from '@angular/core';
import { MatFormField, MatLabel, MatError } from "@angular/material/form-field";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoService } from '../../../../services/estado.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Estado } from '../../../../models/estado.model';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Regiao } from '../../../../models/regiao.model';
import { RegiaoService } from '../../../../services/regiao.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

// Interface para tipificar erro de validação do backend
interface ValidationError {
  field: string;
  message: string;
}

interface BackendErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  timestamp?: string;
  errors?: ValidationError[];
}


@Component({
  selector: 'app-estado-form',
  imports:
    [MatFormField,
      MatLabel,
      MatError,
      ReactiveFormsModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule,
      RouterLink],
  templateUrl: './estado-form.html',
  styleUrl: './estado-form.css',
})
export class EstadoForm implements OnInit {
  readonly form: FormGroup;
  regioes: Regiao[] = [];

  constructor(
    private fb: FormBuilder,
    private estadoService: EstadoService,
    private regiaoService: RegiaoService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: [''],
      sigla: [''],
      idRegiao: [null]
    });

  }

  ngOnInit(): void {
    const estado: Estado = this.activatedRoute.snapshot.data['estado'];

    this.regiaoService.findAll().subscribe(
      data => {
        this.regioes = data;

        if (estado) {
          this.form.patchValue({
            id: estado.id,
            nome: estado.nome,
            sigla: estado.sigla,
            idRegiao: estado.regiao?.id
          });
        }
      }
    )

  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const estado = this.form.value;

    let resultado = (estado.id) ? this.estadoService.update(estado) : this.estadoService.create(estado);

    resultado.subscribe({
      next: (obj) => {
        this.router.navigateByUrl('/estados');
        this.exibirMensagem('Estado salvo com sucesso!');
      },
      error: (erro) => {
        // Tenta processar como erro de validação do backend
        if (erro.status === 400 && erro.error?.errors) {
          this.processarErrosValidacao(erro.error as BackendErrorResponse);
          this.exibirMensagem('Corrija os erros de validação indicados nos campos.');
        } else {
          this.exibirMensagem('Problema ao salvar o estado, entre em contato com o suporte!');
        }
      }
    })
  }

  excluir() {
    if (this.form.valid) {
      const estado = this.form.value;
      if (estado.id != null) {
        this.estadoService.delete(estado.id).subscribe({
          next: () => {
            this.router.navigateByUrl('/estados');
            this.exibirMensagem('Estado excluído com sucesso!');
          },
          error: (erro) => {
            this.exibirMensagem('Problema ao excluir o estado, entre em contato com o suporte!');
          }
        })
      }
    }
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  /**
   * Processa erros de validação retornados pelo backend
   * Adiciona mensagens de validação aos campos correspondentes
   * @param response Resposta de erro do backend com lista de erros de validação
   */
  private processarErrosValidacao(response: BackendErrorResponse): void {
    if (!response.errors || response.errors.length === 0) {
      return;
    }

    // Limpar erros anteriores
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.setErrors(null);
      }
    });

    // Aplicar novos erros do backend
    response.errors.forEach(error => {
      const control = this.form.get(error.field);
      if (control) {
        // Adicionar erro customizado com a mensagem do backend
        control.setErrors({ 'backendError': error.message });
        control.markAsTouched();
      }
    });
  }
}