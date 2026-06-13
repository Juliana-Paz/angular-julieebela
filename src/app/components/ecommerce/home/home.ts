import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PijamaEcommerce, PijamaImagem } from '../ecommerce.types';
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
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
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
  private readonly cdr = inject(ChangeDetectorRef);

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

  // Paginação
  paginaAtual = 0;
  itensPorPagina: number = 20;

  readonly imageBase = 'http://localhost:8080/pijamas/imagens/download/';
  readonly precoMaximo = 9999;

  filtrosAbertos: Record<string, boolean> = {
    preco: true,
    tamanho: true,
    categoria: true,
    modelo: true,
    cor: false,
    genero: false,
    marca: false,
    material: false,
  };

  tamanhos = ['RN', 'P', 'M', 'G', 'GG', 'XG', '1', '2', '4', '6', '8', '10', '12', '16'];
  modelos = ['Manga Longa', 'Manga Curta', 'Body', 'Macacão'];
  generos = ['Menina', 'Menino', 'Unissex'];

  tamanhosSelecionados: string[] = [];
  coresSelecionadas: number[] = [];
  marcasSelecionadas: number[] = [];
  materiaisSelecionados: number[] = [];
  modelosSelecionados: string[] = [];
  generosSelecionados: string[] = [];
  precoMin = 0;
  precoMax = 9999;
  precoMinTemp = 0;
  precoMaxTemp = 9999;
  ordenacao = 'mais_vendidos';
  ordenarAberto = false;
  readonly ordenacaoOpcoes = [
    { value: 'mais_vendidos', label: 'Mais vendidos' },
    { value: 'menor_preco',   label: 'Menor preço' },
    { value: 'maior_preco',   label: 'Maior preço' },
    { value: 'novidades',     label: 'Novidades' },
  ];

  get logado(): boolean { return this.authService.logado(); }

  get ordenacaoLabel(): string {
    return this.ordenacaoOpcoes.find(o => o.value === this.ordenacao)?.label ?? 'Mais vendidos';
  }

  get nomeCategoriaSelecionada(): string {
    return this.categorias.find(c => c.id === this.categoriaSelecionada)?.nome ?? '';
  }

  /** Fatia da página atual exibida no grid */
  get pjamasPagina(): PijamaEcommerce[] {
    const inicio = this.paginaAtual * this.itensPorPagina;
    return this.pjamasFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('.ordenar-dropdown')) {
      this.ordenarAberto = false;
    }
  }

  selecionarOrdenacao(value: string): void {
    this.ordenacao = value;
    this.ordenarAberto = false;
    this.paginaAtual = 0;
    this.aplicarTodosFiltros();
  }

  /**
   * forkJoin garante que TODOS os dados (pijamas + categorias + etc.)
   * estejam carregados antes de aplicar os filtros da URL.
   * Elimina race condition entre pijamas e categorias no F5.
   */
  ngOnInit(): void {
    this.favoritosService.carregar();

    forkJoin({
      pijamas:    this.pijamaService.findAll(),
      categorias: this.categoriaService.findAll(),
      marcas:     this.marcaService.findAll(),
      cores:      this.corService.findAll(),
      materiais:  this.materialService.findAll(),
    }).subscribe({
      next: ({ pijamas, categorias, marcas, cores, materiais }) => {
        this.pijamas    = pijamas;
        this.categorias = categorias;
        this.marcas     = marcas;
        this.cores      = cores;
        this.materiais  = materiais;
        this.loading    = false;

        // Todos os dados prontos — queryParams pode ser aplicado com segurança
        this.route.queryParams.subscribe(params => {
          this.sincronizarQueryParams(params);
          this.aplicarTodosFiltros();
        });

        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar os pijamas.';
        this.cdr.detectChanges();
      },
    });
  }

  private sincronizarQueryParams(params: Record<string, string>): void {
    if (params['categoria']) {
      const cat = this.categorias.find(c =>
        c.nome.toLowerCase().includes(params['categoria'].toLowerCase()));
      this.categoriaSelecionada = cat ? cat.id : null;
    } else {
      this.categoriaSelecionada = null;
    }
    this.searchTerm = params['busca'] ?? '';
  }

  filtrarCategoria(id: number | null): void {
    this.categoriaSelecionada = this.categoriaSelecionada === id ? null : id;
    this.aplicarTodosFiltros();
  }

  toggleFiltro(secao: string): void {
    this.filtrosAbertos[secao] = !this.filtrosAbertos[secao];
  }

  toggleTamanho(tam: string): void {
    this.tamanhosSelecionados = this.tamanhosSelecionados.includes(tam)
      ? this.tamanhosSelecionados.filter(t => t !== tam)
      : [...this.tamanhosSelecionados, tam];
    this.aplicarTodosFiltros();
  }

  filtrarTamanho(tam: string): void { this.toggleTamanho(tam); }

  aplicarFiltroPreco(): void {
    this.precoMin = this.precoMinTemp;
    this.precoMax = this.precoMaxTemp;
    this.paginaAtual = 0;
    this.aplicarTodosFiltros();
  }

  toggleCor(id: number): void {
    this.coresSelecionadas = this.coresSelecionadas.includes(id)
      ? this.coresSelecionadas.filter(x => x !== id)
      : [...this.coresSelecionadas, id];
    this.aplicarTodosFiltros();
  }

  toggleMarca(id: number): void {
    this.marcasSelecionadas = this.marcasSelecionadas.includes(id)
      ? this.marcasSelecionadas.filter(x => x !== id)
      : [...this.marcasSelecionadas, id];
    this.aplicarTodosFiltros();
  }

  toggleMaterial(id: number): void {
    this.materiaisSelecionados = this.materiaisSelecionados.includes(id)
      ? this.materiaisSelecionados.filter(x => x !== id)
      : [...this.materiaisSelecionados, id];
    this.aplicarTodosFiltros();
  }

  toggleModelo(m: string): void {
    this.modelosSelecionados = this.modelosSelecionados.includes(m)
      ? this.modelosSelecionados.filter(x => x !== m)
      : [...this.modelosSelecionados, m];
    this.aplicarTodosFiltros();
  }

  toggleGenero(g: string): void {
    this.generosSelecionados = this.generosSelecionados.includes(g)
      ? this.generosSelecionados.filter(x => x !== g)
      : [...this.generosSelecionados, g];
    this.aplicarTodosFiltros();
  }

  limparFiltros(): void {
    this.categoriaSelecionada = null;
    this.tamanhosSelecionados = [];
    this.modelosSelecionados = [];
    this.coresSelecionadas = [];
    this.marcasSelecionadas = [];
    this.materiaisSelecionados = [];
    this.generosSelecionados = [];
    this.precoMin = 0;
    this.precoMax = this.precoMaximo;
    this.precoMinTemp = 0;
    this.precoMaxTemp = this.precoMaximo;
    this.searchTerm = '';
    this.aplicarTodosFiltros();
  }

  aplicarOrdenacao(): void { this.aplicarTodosFiltros(); }

  aplicarTodosFiltros(): void {
    let resultado = [...this.pijamas];

    if (this.searchTerm?.trim()) {
      const termo = this.searchTerm.toLowerCase();
      resultado = resultado.filter(p => p.nome.toLowerCase().includes(termo));
    }

    if (this.categoriaSelecionada !== null) {
      resultado = resultado.filter(p => p.categoria?.id === this.categoriaSelecionada);
    }

    // Filtro de preço apenas quando o usuário ajustou os limites
    if (this.precoMin > 0) {
      resultado = resultado.filter(p => p.preco >= this.precoMin);
    }
    if (this.precoMax < this.precoMaximo) {
      resultado = resultado.filter(p => p.preco <= this.precoMax);
    }

    if (this.tamanhosSelecionados.length) {
      resultado = resultado.filter(p =>
        p.variantes?.some(v => this.tamanhosSelecionados.includes(v.tamanhoNome)));
    }

    if (this.modelosSelecionados.length) {
      resultado = resultado.filter(p => this.modelosSelecionados.includes(p.modelo));
    }

    if (this.marcasSelecionadas.length) {
      resultado = resultado.filter(p =>
        p.marca?.id != null && this.marcasSelecionadas.includes(p.marca.id));
    }

    if (this.materiaisSelecionados.length) {
      resultado = resultado.filter(p =>
        p.materiais?.some(m => this.materiaisSelecionados.includes(m.id)));
    }

    if (this.coresSelecionadas.length) {
      resultado = resultado.filter(p =>
        p.variantes?.some(v => v.cor != null && this.coresSelecionadas.includes(v.cor.id)));
    }

    if (this.generosSelecionados.length) {
      resultado = resultado.filter(p =>
        this.generosSelecionados.some(g =>
          p.sexo?.nome?.toLowerCase().includes(g.toLowerCase())));
    }

    this.paginaAtual = 0; // volta para a 1ª página a cada novo filtro
    this.aplicarOrdenacaoLista(resultado);
  }

  aplicarOrdenacaoLista(lista: PijamaEcommerce[]): void {
    switch (this.ordenacao) {
      case 'mais_vendidos':
        // modelo não tem totalVendido — mantém ordem retornada pela API
        break;
      case 'menor_preco':
        lista.sort((a, b) => a.preco - b.preco);
        break;
      case 'maior_preco':
        lista.sort((a, b) => b.preco - a.preco);
        break;
      case 'novidades':
        // id maior = cadastrado mais recentemente
        lista.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
    }
    this.pjamasFiltrados = lista;
  }

  aplicarFiltros(): void { this.aplicarTodosFiltros(); }

  get totalPaginas(): number {
    return Math.ceil(this.pjamasFiltrados.length / this.itensPorPagina);
  }

  get paginasVisiveis(): number[] {
    const total = this.totalPaginas;
    const atual = this.paginaAtual;
    const paginas: number[] = [];

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }

    paginas.push(0);

    if (atual > 2) paginas.push(-1);

    const inicio = Math.max(1, atual - 1);
    const fim = Math.min(total - 2, atual + 1);
    for (let i = inicio; i <= fim; i++) paginas.push(i);

    if (atual < total - 3) paginas.push(-1);

    paginas.push(total - 1);

    return paginas;
  }

  get rangeLabel(): string {
    const inicio = this.paginaAtual * this.itensPorPagina + 1;
    const fim = Math.min(inicio + this.itensPorPagina - 1, this.pjamasFiltrados.length);
    return `${inicio} – ${fim} of ${this.pjamasFiltrados.length}`;
  }

  irParaPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas) return;
    this.paginaAtual = pagina;
    document.querySelector('.produtos-area')?.scrollIntoView({ behavior: 'smooth' });
  }

  onItensPorPaginaMudou(): void {
    this.paginaAtual = 0;
  }

  getImageUrl(fid: string): string {
    return this.imageBase + encodeURIComponent(fid);
  }

  getImagemUrl(img: PijamaImagem): string {
    return this.imageBase + encodeURIComponent(img?.fid ?? '');
  }

  getCategoriaClass(obj: PijamaEcommerce): string {
    const nome = obj.categoria?.nome?.toLowerCase() ?? '';
    if (nome.includes('menina'))  return 'cat-menina';
    if (nome.includes('menino'))  return 'cat-menino';
    if (nome.includes('unissex')) return 'cat-unissex';
    if (nome.includes('beb'))     return 'cat-bebe';
    return '';
  }

  getVariantTamanhos(pijama: PijamaEcommerce): string[] {
    const seen = new Set<string>();
    for (const v of pijama.variantes ?? []) seen.add(v.tamanhoNome);
    return Array.from(seen);
  }

  getVariantCores(pijama: PijamaEcommerce): { id: number; nome: string; hexadecimal: string }[] {
    const seen = new Set<number>();
    const result: { id: number; nome: string; hexadecimal: string }[] = [];
    for (const v of pijama.variantes ?? []) {
      if (v.cor && !seen.has(v.cor.id)) { seen.add(v.cor.id); result.push(v.cor); }
    }
    return result;
  }

  verDetalhes(id: number): void { this.router.navigate(['/detalhe-pijama', id]); }
  verDetalhe(id: number): void  { this.verDetalhes(id); }

  toggleFavorito(id: number): void {
    if (!this.logado) { this.router.navigate(['/login']); return; }
    this.favoritosService.toggle(id);
  }

  toggleDesejo(event: Event, obj: PijamaEcommerce): void {
    event.stopPropagation();
    this.toggleFavorito(obj.id);
  }

  ehFavorito(id: number): boolean  { return this.favoritosService.ehFavorito(id); }
  estaNoDesejo(id: number): boolean { return this.ehFavorito(id); }
}
