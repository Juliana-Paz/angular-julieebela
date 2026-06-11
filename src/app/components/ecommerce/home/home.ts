import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PijamaEcommerce } from '../ecommerce.types';
import { Categoria } from '../../../models/categoria.model';
import { Cor } from '../../../models/cor.model';
import { Marca } from '../../../models/marca.model';
import { Material } from '../../../models/material.model';
import { PijamaService } from '../../../services/pijama.service';
import { CategoriaService } from '../../../services/categoria.service';
import { CorService } from '../../../services/cor.service';
import { MarcaService } from '../../../services/marca.service';
import { MaterialService } from '../../../services/material.service';
import { FavoritosService } from '../../../services/favoritos.service';
import { EcommerceAuthService } from '../../../services/ecommerce-auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly pijamaService = inject(PijamaService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly corService = inject(CorService);
  private readonly marcaService = inject(MarcaService);
  private readonly materialService = inject(MaterialService);
  private readonly favoritosService = inject(FavoritosService);
  private readonly authService = inject(EcommerceAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  pijamas: PijamaEcommerce[] = [];
  pjamasFiltrados: PijamaEcommerce[] = [];
  categorias: Categoria[] = [];
  cores: Cor[] = [];
  marcas: Marca[] = [];
  materiais: Material[] = [];
  loading = true;
  errorMessage = '';
  categoriaSelecionada: number | null = null;
  searchTerm = '';

  readonly imageBase = 'http://localhost:8080/pijamas/imagens/download/';
  readonly precoMaximo = 500;

  filtroAberto: Record<string, boolean> = {
    categorias: true,
    preco: true,
    tamanho: true,
    cor: false,
    modelo: false,
    genero: false,
    marca: false,
    material: false,
  };

  tamanhos = ['RN', 'P', 'M', 'G', 'GG', 'XG', 'Adulto', '1', '2', '4', '6', '8', '10', '12', '16'];
  modelos = ['Manga Longa', 'Manga Curta', 'Body', 'Macacão'];
  generos = ['Menina', 'Menino', 'Unissex'];

  tamanhoSelecionado: string | null = null;
  coresSelecionadas: number[] = [];
  marcasSelecionadas: number[] = [];
  materiaisSelecionados: number[] = [];
  modelosSelecionados: string[] = [];
  generosSelecionados: string[] = [];
  precoMin = 0;
  precoMax = 500;
  ordenacao = 'relevancia';
  ordenacaoAberta = false;
  readonly ordenacaoOpcoes = [
    { value: 'relevancia',    label: 'Mais relevantes' },
    { value: 'mais-vendidos', label: 'Mais vendidos' },
    { value: 'menor-preco',   label: 'Menor preço' },
    { value: 'maior-preco',   label: 'Maior preço' },
    { value: 'novidades',     label: 'Novidades' },
  ];

  get logado(): boolean { return this.authService.logado(); }

  get ordenacaoLabel(): string {
    return this.ordenacaoOpcoes.find(o => o.value === this.ordenacao)?.label ?? 'Mais relevantes';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('.ordenacao-wrapper')) {
      this.ordenacaoAberta = false;
    }
  }

  selecionarOrdenacao(value: string): void {
    this.ordenacao = value;
    this.ordenacaoAberta = false;
    this.ordenar();
  }

  ngOnInit(): void {
    forkJoin({
      pijamas: this.pijamaService.findAll(),
      categorias: this.categoriaService.findAll(),
      cores: this.corService.findAll(),
      marcas: this.marcaService.findAll(),
      materiais: this.materialService.findAll(),
    }).subscribe({
      next: ({ pijamas, categorias, cores, marcas, materiais }) => {
        this.pijamas = pijamas;
        this.categorias = categorias;
        this.cores = cores;
        this.marcas = marcas;
        this.materiais = materiais;
        this.loading = false;
        this.aplicarFiltros();
        this.aplicarQueryParams(this.route.snapshot.queryParams);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar os pijamas.';
      },
    });

    this.favoritosService.carregar();

    this.route.queryParams.subscribe(params => {
      if (this.categorias.length > 0) {
        this.aplicarQueryParams(params);
      }
    });
  }

  private aplicarQueryParams(params: Params): void {
    if (params['busca'] !== undefined) {
      this.searchTerm = params['busca'] || '';
      this.aplicarFiltros();
    }
    if (params['categoria']) {
      const cat = this.categorias.find(c =>
        c.nome.toLowerCase().includes((params['categoria'] as string).toLowerCase()));
      if (cat) this.filtrarCategoria(cat.id);
    } else if (!params['busca']) {
      this.filtrarCategoria(null);
    }
  }

  filtrarCategoria(id: number | null): void {
    this.categoriaSelecionada = id;
    this.aplicarFiltros();
  }

  toggleFiltro(secao: string): void {
    this.filtroAberto[secao] = !this.filtroAberto[secao];
  }

  filtrarTamanho(tam: string): void {
    this.tamanhoSelecionado = this.tamanhoSelecionado === tam ? null : tam;
    this.aplicarFiltros();
  }

  aplicarFiltroPreco(): void {
    this.aplicarFiltros();
  }

  toggleCor(id: number): void {
    this.coresSelecionadas = this.coresSelecionadas.includes(id)
      ? this.coresSelecionadas.filter(x => x !== id)
      : [...this.coresSelecionadas, id];
    this.aplicarFiltros();
  }

  toggleMarca(id: number): void {
    this.marcasSelecionadas = this.marcasSelecionadas.includes(id)
      ? this.marcasSelecionadas.filter(x => x !== id)
      : [...this.marcasSelecionadas, id];
    this.aplicarFiltros();
  }

  toggleMaterial(id: number): void {
    this.materiaisSelecionados = this.materiaisSelecionados.includes(id)
      ? this.materiaisSelecionados.filter(x => x !== id)
      : [...this.materiaisSelecionados, id];
    this.aplicarFiltros();
  }

  toggleModelo(m: string): void {
    this.modelosSelecionados = this.modelosSelecionados.includes(m)
      ? this.modelosSelecionados.filter(x => x !== m)
      : [...this.modelosSelecionados, m];
    this.aplicarFiltros();
  }

  toggleGenero(g: string): void {
    this.generosSelecionados = this.generosSelecionados.includes(g)
      ? this.generosSelecionados.filter(x => x !== g)
      : [...this.generosSelecionados, g];
    this.aplicarFiltros();
  }

  ordenar(): void {
    switch (this.ordenacao) {
      case 'menor-preco':
        this.pjamasFiltrados = [...this.pjamasFiltrados].sort((a, b) => a.preco - b.preco);
        break;
      case 'maior-preco':
        this.pjamasFiltrados = [...this.pjamasFiltrados].sort((a, b) => b.preco - a.preco);
        break;
      default:
        this.aplicarFiltros();
    }
  }

  aplicarFiltros(): void {
    let lista = [...this.pijamas];

    if (this.searchTerm)
      lista = lista.filter(p => p.nome.toLowerCase().includes(this.searchTerm.toLowerCase()));

    if (this.categoriaSelecionada !== null)
      lista = lista.filter(p => p.categoria?.id === this.categoriaSelecionada);

    if (this.precoMin > 0)
      lista = lista.filter(p => p.preco >= this.precoMin);

    if (this.precoMax < this.precoMaximo)
      lista = lista.filter(p => p.preco <= this.precoMax);

    if (this.tamanhoSelecionado)
      lista = lista.filter(p =>
        p.variantes?.some(v => v.tamanhoNome === this.tamanhoSelecionado));

    if (this.modelosSelecionados.length)
      lista = lista.filter(p => this.modelosSelecionados.includes(p.modelo));

    if (this.marcasSelecionadas.length)
      lista = lista.filter(p => p.marca?.id != null && this.marcasSelecionadas.includes(p.marca.id));

    if (this.materiaisSelecionados.length)
      lista = lista.filter(p =>
        p.materiais?.some(m => this.materiaisSelecionados.includes(m.id)));

    if (this.coresSelecionadas.length)
      lista = lista.filter(p =>
        p.variantes?.some(v => v.cor != null && this.coresSelecionadas.includes(v.cor.id)));

    if (this.generosSelecionados.length)
      lista = lista.filter(p =>
        this.generosSelecionados.some(g =>
          p.sexo?.nome?.toLowerCase().includes(g.toLowerCase())));

    this.pjamasFiltrados = lista;
  }

  getImageUrl(fid: string): string {
    return this.imageBase + encodeURIComponent(fid);
  }

  getVariantTamanhos(pijama: PijamaEcommerce): string[] {
    const seen = new Set<string>();
    for (const v of pijama.variantes ?? []) {
      seen.add(v.tamanhoNome);
    }
    return Array.from(seen);
  }

  getVariantCores(pijama: PijamaEcommerce): { id: number; nome: string; hexadecimal: string }[] {
    const seen = new Set<number>();
    const result: { id: number; nome: string; hexadecimal: string }[] = [];
    for (const v of pijama.variantes ?? []) {
      if (v.cor && !seen.has(v.cor.id)) {
        seen.add(v.cor.id);
        result.push(v.cor);
      }
    }
    return result;
  }

  verDetalhes(id: number): void {
    this.router.navigate(['/detalhe-pijama', id]);
  }

  toggleFavorito(id: number): void {
    if (!this.logado) { this.router.navigate(['/login']); return; }
    this.favoritosService.toggle(id);
  }

  ehFavorito(id: number): boolean {
    return this.favoritosService.ehFavorito(id);
  }
}
