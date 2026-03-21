import { Component, OnInit } from '@angular/core';
import { MatToolbar } from "@angular/material/toolbar";
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EstadoService } from '../../../services/estado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Estado } from '../../../models/estado.model';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Regiao } from '../../../models/regiao.model';
import { RegiaoService } from '../../../services/regiao.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-estado-form',
  imports:
    [MatToolbar,
      MatCardModule,
      MatFormField,
      MatLabel,
      MatButtonModule,
      ReactiveFormsModule,
      MatInputModule,
      MatSelectModule],
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
        this.exibirMensagem('Problema ao salvar o estado, entre em contato com o suporte!');
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

}
