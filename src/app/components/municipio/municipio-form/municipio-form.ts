import { Component, OnInit } from '@angular/core';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MunicipioService } from '../../../services/municipio.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Municipio } from '../../../models/municipio.model';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Estado } from '../../../models/estado.model';
import { EstadoService } from '../../../services/estado.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-municipio-form',
  imports:
    [MatFormField,
      MatLabel,
      ReactiveFormsModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule,
      RouterLink],
  templateUrl: './municipio-form.html',
  styleUrl: './municipio-form.css',
})
export class MunicipioForm implements OnInit {
  readonly form: FormGroup;
  estados: Estado[] = [];

  constructor(
    private fb: FormBuilder,
    private municipioService: MunicipioService,
    private estadoService: EstadoService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: [''],
      idEstado: [null]
    });

  }

  ngOnInit(): void {
    const municipio: Municipio = this.activatedRoute.snapshot.data['municipio'];

    this.estadoService.findAll().subscribe(
      data => {
        this.estados = data;

        if (municipio) {
          this.form.patchValue({
            id: municipio.id,
            nome: municipio.nome,
            idEstado: municipio.estado?.id
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
    const municipio = this.form.value;

    let resultado = (municipio.id) ? this.municipioService.update(municipio) : this.municipioService.create(municipio);

    resultado.subscribe({
      next: (obj) => {
        this.router.navigateByUrl('/municipios');
        this.exibirMensagem('Município salvo com sucesso!');
      },
      error: (erro) => {
        this.exibirMensagem('Problema ao salvar o município, entre em contato com o suporte!');
      }
    })
  }

  excluir() {
    if (this.form.valid) {
      const municipio = this.form.value;
      if (municipio.id != null) {
        this.municipioService.delete(municipio.id).subscribe({
          next: () => {
            this.router.navigateByUrl('/municipios');
            this.exibirMensagem('Município excluído com sucesso!');
          },
          error: () => {
            this.exibirMensagem('Problema ao excluir o município, entre em contato com o suporte!');
          }
        })
      }
    }
  }

  exibirMensagem(msg: string) {
    this.snack.open(msg, 'Fechar', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 4000
    });
  }
}
