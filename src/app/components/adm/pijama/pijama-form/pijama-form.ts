import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef,
  NgZone, OnInit, ViewChild, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import {
  FormArray, FormBuilder, FormGroup,
  ReactiveFormsModule, Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import Sortable from 'sortablejs';
import { Pijama, PijamaVariante } from '../../../../models/pijama.model';
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
    MatButtonModule, MatIconModule, MatSlideToggleModule,
    MatDividerModule, MatTooltipModule, RouterLink,
  ],
  templateUrl: './pijama-form.html',
  styleUrl: './pijama-form.css',
})
export class PijamaForm implements OnInit, AfterViewInit {
  readonly form: FormGroup;

  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  cores: Cor[] = [];
  materiais: Material[] = [];
  estampas: Estampa[] = [];

  readonly tamanhos = [
    { id: 1, nome: 'RN' },
    { id: 2, nome: 'P' },
    { id: 3, nome: 'M' },
    { id: 4, nome: 'G' },
    { id: 5, nome: 'GG' },
    { id: 6, nome: 'XG' },
    { id: 7, nome: 'Adulto' },
    { id: 8, nome: '1 Ano' },
    { id: 9, nome: '2 Anos' },
    { id: 10, nome: '4 Anos' },
    { id: 11, nome: '6 Anos' },
    { id: 12, nome: '8 Anos' },
    { id: 13, nome: '10 Anos' },
    { id: 14, nome: '12 Anos' },
    { id: 15, nome: '16 Anos' },
  ];
  readonly sexos = [
    { id: 1, nome: 'Feminino' },
    { id: 2, nome: 'Masculino' },
    { id: 3, nome: 'Unissex' },
  ];
  readonly modelos = [
    'Manga Longa', 'Manga Curta', 'Short e Camiseta',
    'Calça e Camiseta', 'Body', 'Macacão', 'Camisola',
  ];

  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('gridSalvas') gridSalvasRef!: ElementRef;
  @ViewChild('gridNovas') gridNovasRef!: ElementRef;

  private sortableSalvas?: Sortable;
  private sortableNovas?: Sortable;

  readonly modoVisualizacao = signal(false);

  imagensSalvas: { fid: string; nomeOriginal: string; url: string }[] = [];
  novasImagens: { file: File; preview: string; name: string }[] = [];
  indiceCapa = signal(0);
  imagensParaRemover: string[] = [];

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
      ativo: [true],
      idSexo: [null, Validators.required],
      idCategoria: [null, Validators.required],
      idMarca: [null, Validators.required],
      idEstampa: [null],
      idsMateriais: [[]],
      variantes: this.fb.array([]),
    });
  }

  get variantesArray(): FormArray {
    return this.form.get('variantes') as FormArray;
  }

  criarVarianteGroup(v?: { idTamanho?: number | null; idCor?: number | null; estoque?: number }): FormGroup {
    return this.fb.group({
      idTamanho: [v?.idTamanho ?? null, Validators.required],
      idCor: [v?.idCor ?? null],
      estoque: [v?.estoque ?? 0, [Validators.required, Validators.min(0)]],
    });
  }

  adicionarVariante(): void {
    this.variantesArray.push(this.criarVarianteGroup());
  }

  removerVariante(index: number): void {
    if (this.variantesArray.length > 1) {
      this.variantesArray.removeAt(index);
    }
  }

  ngOnInit(): void {
    const pijama: Pijama = this.activatedRoute.snapshot.data['pijama'];
    this.modoVisualizacao.set(this.activatedRoute.snapshot.data['modo'] === 'view');

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
          this.imagensSalvas = pijama.imagens?.map(a => ({
            fid: a.fid,
            nomeOriginal: a.nomeOriginal,
            url: 'http://localhost:8080/pijamas/imagens/download/' + a.fid,
          })) ?? [];
          this.indiceCapa.set(0);
          this.form.patchValue({
            id: pijama.id,
            nome: pijama.nome,
            descricao: pijama.descricao,
            preco: pijama.preco,
            modelo: pijama.modelo,
            ativo: pijama.ativo,
            idSexo: pijama.sexo?.id ?? null,
            idCategoria: pijama.categoria?.id ?? null,
            idMarca: pijama.marca?.id ?? null,
            idEstampa: pijama.estampa?.id ?? null,
            idsMateriais: pijama.materiais?.map(m => m.id) ?? [],
          });

          while (this.variantesArray.length) {
            this.variantesArray.removeAt(0);
          }
          pijama.variantes?.forEach((v: PijamaVariante) => {
            this.variantesArray.push(this.criarVarianteGroup({
              idTamanho: v.tamanhoId,
              idCor: v.cor?.id ?? null,
              estoque: v.estoque,
            }));
          });
        }

        if (this.variantesArray.length === 0) {
          this.adicionarVariante();
        }

        if (this.modoVisualizacao()) {
          this.form.disable({ emitEvent: false });
        }

        setTimeout(() => this.inicializarSortable(), 100);
      },
      error: () => this.exibirMensagem('Erro ao carregar dados. Verifique a conexão com o servidor.'),
    });
  }

  ngAfterViewInit(): void {
    this.inicializarSortable();
  }

  private inicializarSortable(): void {
    if (this.gridSalvasRef?.nativeElement) {
      this.sortableSalvas?.destroy();
      this.sortableSalvas = Sortable.create(this.gridSalvasRef.nativeElement, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: (event: { oldIndex?: number; newIndex?: number }) => {
          if (event.oldIndex === undefined || event.newIndex === undefined) return;
          const item = this.imagensSalvas.splice(event.oldIndex, 1)[0];
          this.imagensSalvas.splice(event.newIndex, 0, item);
          this.indiceCapa.set(0);
        },
      });
    }

    if (this.gridNovasRef?.nativeElement && this.novasImagens.length > 0) {
      this.sortableNovas?.destroy();
      this.sortableNovas = Sortable.create(this.gridNovasRef.nativeElement, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: (event: { oldIndex?: number; newIndex?: number }) => {
          if (event.oldIndex === undefined || event.newIndex === undefined) return;
          const item = this.novasImagens.splice(event.oldIndex, 1)[0];
          this.novasImagens.splice(event.newIndex, 0, item);
          if (this.imagensSalvas.length === 0) this.indiceCapa.set(0);
        },
      });
    }
  }

  private reinicializarSortableSalvas(): void {
    setTimeout(() => {
      this.sortableSalvas?.destroy();
      this.sortableSalvas = undefined;
      if (this.gridSalvasRef?.nativeElement) {
        this.sortableSalvas = Sortable.create(this.gridSalvasRef.nativeElement, {
          animation: 150,
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          dragClass: 'sortable-drag',
          onEnd: (event: { oldIndex?: number; newIndex?: number }) => {
            if (event.oldIndex === undefined || event.newIndex === undefined) return;
            const item = this.imagensSalvas.splice(event.oldIndex, 1)[0];
            this.imagensSalvas.splice(event.newIndex, 0, item);
            this.indiceCapa.set(0);
          },
        });
      }
    }, 100);
  }

  private reinicializarSortableNovas(): void {
    setTimeout(() => {
      this.sortableNovas?.destroy();
      this.sortableNovas = undefined;
      if (this.gridNovasRef?.nativeElement) {
        this.sortableNovas = Sortable.create(this.gridNovasRef.nativeElement, {
          animation: 150,
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          dragClass: 'sortable-drag',
          onEnd: (event: { oldIndex?: number; newIndex?: number }) => {
            if (event.oldIndex === undefined || event.newIndex === undefined) return;
            const item = this.novasImagens.splice(event.oldIndex, 1)[0];
            this.novasImagens.splice(event.newIndex, 0, item);
            if (this.imagensSalvas.length === 0) this.indiceCapa.set(0);
          },
        });
      }
    }, 100);
  }

  onImagensChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        this.ngZone.run(() => {
          this.novasImagens.push({ file, preview: e.target?.result as string, name: file.name });
          if (this.imagensSalvas.length === 0 && this.novasImagens.length === 1) {
            this.indiceCapa.set(0);
          }
          this.cdr.detectChanges();
          this.reinicializarSortableNovas();
        });
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        this.ngZone.run(() => {
          this.novasImagens.push({ file, preview: e.target?.result as string, name: file.name });
          if (this.imagensSalvas.length === 0 && this.novasImagens.length === 1) {
            this.indiceCapa.set(0);
          }
          this.cdr.detectChanges();
          this.reinicializarSortableNovas();
        });
      };
      reader.readAsDataURL(file);
    });
  }

  removerNovaImagem(index: number): void {
    this.novasImagens.splice(index, 1);
    this.reinicializarSortableNovas();
  }

  removerImagemSalva(index: number): void {
    const img = this.imagensSalvas[index];
    this.imagensParaRemover.push(img.fid);
    this.imagensSalvas.splice(index, 1);
    if (this.indiceCapa() >= this.imagensSalvas.length) {
      this.indiceCapa.set(0);
    }
    this.reinicializarSortableSalvas();
  }

  moverImagemSalva(de: number, para: number): void {
    const item = this.imagensSalvas.splice(de, 1)[0];
    this.imagensSalvas.splice(para, 0, item);
    this.indiceCapa.set(0);
    this.reinicializarSortableSalvas();
  }

  moverImagemNova(de: number, para: number): void {
    const item = this.novasImagens.splice(de, 1)[0];
    this.novasImagens.splice(para, 0, item);
    if (this.imagensSalvas.length === 0) this.indiceCapa.set(0);
  }

  definirCapa(index: number): void {
    this.indiceCapa.set(index);
  }

  async salvarImagens(pijamaId: number): Promise<void> {
    for (const fid of this.imagensParaRemover) {
      try {
        await firstValueFrom(this.pijamaService.removerImagem(pijamaId, fid));
      } catch { this.exibirMensagem('Erro ao remover imagem.'); }
    }

    for (const img of this.novasImagens) {
      const fd = new FormData();
      fd.append('file', img.file, img.name);
      try {
        await firstValueFrom(this.pijamaService.adicionarImagem(pijamaId, fd));
      } catch { this.exibirMensagem(`Erro ao salvar: ${img.name}`); }
    }

    try {
      const pijamaAtualizado = await firstValueFrom(
        this.pijamaService.findById(pijamaId)
      );
      const todasImagens: any[] = pijamaAtualizado.imagens ?? [];

      const capaIndex = this.indiceCapa();
      const ordens = todasImagens.map((img: any) => {
        const posGrid = this.imagensSalvas.findIndex(s => s.fid === img.fid);
        const ordem = posGrid >= 0
          ? posGrid
          : this.imagensSalvas.length + this.novasImagens.findIndex(
              n => n.name === img.nomeOriginal
            );
        return {
          arquivoId: img.id,
          ordem: ordem >= 0 ? ordem : 99,
          capa: (ordem >= 0 ? ordem : 99) === capaIndex,
        };
      });

      if (ordens.length > 0) {
        await firstValueFrom(
          this.pijamaService.reordenarImagens(pijamaId, ordens)
        );
      }
    } catch {
      this.exibirMensagem('Erro ao salvar ordem das imagens.');
    }

    this.novasImagens = [];
    this.imagensParaRemover = [];
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
    formData.append('ativo', String(valores.ativo));
    formData.append('idSexo', String(valores.idSexo));
    formData.append('idCategoria', String(valores.idCategoria));
    formData.append('idMarca', String(valores.idMarca));
    if (valores.idEstampa) formData.append('idEstampa', String(valores.idEstampa));
    (valores.idsMateriais as number[]).forEach(id => formData.append('idsMateriais', String(id)));

    const variantesJson = JSON.stringify(
      this.variantesArray.value.map((v: any) => ({
        idTamanho: v.idTamanho,
        idCor: v.idCor || null,
        estoque: Number(v.estoque),
      })),
    );
    formData.append('variantes', variantesJson);

    const req = valores.id
      ? this.pijamaService.update(valores.id, formData)
      : this.pijamaService.create(formData);

    req.subscribe({
      next: async (criado) => {
        await this.salvarImagens(criado.id);
        this.router.navigateByUrl('/adm/pijamas');
        this.exibirMensagem('Pijama salvo com sucesso!');
      },
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
