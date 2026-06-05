import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { Pijama } from '../../../../models/pijama.model';
import { Categoria } from '../../../../models/categoria.model';
import { Marca } from '../../../../models/marca.model';
import { Cor } from '../../../../models/cor.model';
import { Material } from '../../../../models/material.model';
import { Estampa } from '../../../../models/estampa.model';
import { PijamaService } from '../../../../services/pijama.service';
import { CategoriaService } from '../../../../services/categoria.service';
import { MarcaService } from '../../../../services/marca.service';
import { CorService } from '../../../../services/cor.service';
import { MaterialService } from '../../../../services/material.service';
import { EstampaService } from '../../../../services/estampa.service';

interface ValidationError { field: string; message: string; }
interface BackendErrorResponse { errors?: ValidationError[]; }

@Component({
  selector: 'app-pijama-form',
  imports: [
    CommonModule, MatFormField, MatLabel, MatError,
    ReactiveFormsModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSlideToggleModule, RouterLink,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
  templateUrl: './pijama-form.html',
  styleUrl: './pijama-form.css',
})
export class PijamaForm implements OnInit {
  readonly form: FormGroup;

  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  cores: Cor[] = [];
  materiais: Material[] = [];
  estampas: Estampa[] = [];

  readonly tamanhos = [
    { id: 1, nome: 'Recém-Nascido' },
    { id: 2, nome: '1 a 3 Meses' },
    { id: 3, nome: '3 a 6 Meses' },
    { id: 4, nome: '6 a 9 Meses' },
    { id: 5, nome: '1 Ano' },
    { id: 6, nome: '2 Anos' },
    { id: 7, nome: '3 Anos' },
    { id: 8, nome: '4 Anos' },
    { id: 9, nome: '6 Anos' },
    { id: 10, nome: '8 Anos' },
    { id: 11, nome: '10 Anos' },
    { id: 12, nome: '12 Anos' },
    { id: 13, nome: 'Adulto' },
  ];
  readonly sexos = [
    { id: 1, nome: 'Feminino' },
    { id: 2, nome: 'Masculino' },
    { id: 3, nome: 'Unissex' },
  ];
  readonly modelos = ['Calça e Camiseta', 'Macacão', 'Body', 'Camisola', 'Short e Camiseta'];

  arquivoSelecionado: File | null = null;
  previewUrl: string | null = null;
  arquivosExistentes: { fid: string; nomeOriginal: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private pijamaService: PijamaService,
    private categoriaService: CategoriaService,
    private marcaService: MarcaService,
    private corService: CorService,
    private materialService: MaterialService,
    private estampaService: EstampaService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: [''],
      preco: [null, [Validators.required, Validators.min(0.01)]],
      modelo: ['', Validators.required],
      estoque: [0, [Validators.required, Validators.min(0)]],
      ativo: [true],
      idTamanho: [null, Validators.required],
      idSexo: [null, Validators.required],
      idCategoria: [null, Validators.required],
      idMarca: [null, Validators.required],
      idEstampa: [null],
      idsCores: [[]],
      idsMateriais: [[]],
    });
  }

  ngOnInit(): void {
    const pijama: Pijama = this.activatedRoute.snapshot.data['pijama'];

    forkJoin({
      categorias: this.categoriaService.findAll(),
      marcas: this.marcaService.findAll(),
      cores: this.corService.findAll(),
      materiais: this.materialService.findAll(),
      estampas: this.estampaService.findAll(),
    }).subscribe({
      next: ({ categorias, marcas, cores, materiais, estampas }) => {
        this.categorias = categorias;
        this.marcas = marcas;
        this.cores = cores;
        this.materiais = materiais;
        this.estampas = estampas;

        if (pijama) {
          this.arquivosExistentes = pijama.imagens?.map(a => ({ fid: a.fid, nomeOriginal: a.nomeOriginal })) ?? [];
          this.form.patchValue({
            id: pijama.id,
            nome: pijama.nome,
            descricao: pijama.descricao,
            preco: pijama.preco,
            modelo: pijama.modelo,
            estoque: pijama.estoque,
            ativo: pijama.ativo,
            idTamanho: pijama.tamanho?.id ?? null,
            idSexo: pijama.sexo?.id ?? null,
            idCategoria: pijama.categoria?.id ?? null,
            idMarca: pijama.marca?.id ?? null,
            idEstampa: pijama.estampa?.id ?? null,
            idsCores: pijama.cores?.map(c => c.id) ?? [],
            idsMateriais: pijama.materiais?.map(m => m.id) ?? [],
          });
        }
      },
      error: () => this.exibirMensagem('Erro ao carregar dados. Verifique a conexão com o servidor.'),
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.arquivoSelecionado = input.files[0];
    this.previewUrl = null;

    const reader = new FileReader();
    reader.onload = e => (this.previewUrl = e.target?.result as string);
    reader.readAsDataURL(this.arquivoSelecionado);
  }

  removerArquivoExistente(fid: string): void {
    this.arquivosExistentes = this.arquivosExistentes.filter(a => a.fid !== fid);
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const formData = new FormData();
    const valores = this.form.value;

    const precoNum = parseFloat(
      String(valores.preco ?? '0').replace(/[^\d,]/g, '').replace(',', '.')
    ) || 0;

    formData.append('nome', valores.nome);
    formData.append('descricao', valores.descricao ?? '');
    formData.append('preco', String(precoNum));
    formData.append('modelo', valores.modelo);
    formData.append('estoque', String(valores.estoque));
    formData.append('ativo', String(valores.ativo));
    formData.append('idTamanho', String(valores.idTamanho));
    formData.append('idSexo', String(valores.idSexo));
    formData.append('idCategoria', String(valores.idCategoria));
    formData.append('idMarca', String(valores.idMarca));
    if (valores.idEstampa) formData.append('idEstampa', String(valores.idEstampa));
    (valores.idsCores as number[]).forEach(id => formData.append('idsCores', String(id)));
    (valores.idsMateriais as number[]).forEach(id => formData.append('idsMateriais', String(id)));
    if (this.arquivoSelecionado) formData.append('file', this.arquivoSelecionado, this.arquivoSelecionado.name);

    const req = valores.id
      ? this.pijamaService.update(valores.id, formData)
      : this.pijamaService.create(formData);

    req.subscribe({
      next: () => { this.router.navigateByUrl('/adm/pijamas'); this.exibirMensagem('Pijama salvo com sucesso!'); },
      error: (e) => {
        if (e.status === 400 && e.error?.errors) { this.processarErros(e.error); this.exibirMensagem('Corrija os erros indicados.'); }
        else this.exibirMensagem('Erro ao salvar pijama.');
      },
    });
  }

  excluir(): void {
    const { id } = this.form.value;
    if (!id || !confirm('Deseja realmente excluir este pijama?')) return;
    this.pijamaService.delete(id).subscribe({
      next: () => { this.router.navigateByUrl('/adm/pijamas'); this.exibirMensagem('Pijama excluído!'); },
      error: () => this.exibirMensagem('Erro ao excluir pijama.'),
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
