import { computed, Injectable, signal } from '@angular/core';
import { CarrinhoItem, PijamaEcommerce } from '../components/ecommerce/ecommerce.types';
import { PijamaVariante } from '../models/pijama.model';

interface CupomAplicado { codigo: string; desconto: number; }

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly storageKey = 'julie-bela-carrinho';
  private readonly cupomStorageKey = 'julie-bela-cupom';
  private readonly itemsSignal = signal<CarrinhoItem[]>(this.loadFromStorage());
  private readonly cupomSignal = signal<CupomAplicado | null>(this.loadCupomFromStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly cupom = this.cupomSignal.asReadonly();
  readonly quantidadeTotal = computed(() =>
    this.itemsSignal().reduce((total, item) => total + item.quantidade, 0),
  );
  readonly valorTotal = computed(() =>
    this.itemsSignal().reduce((total, item) => total + item.pijama.preco * item.quantidade, 0),
  );
  readonly desconto = computed(() => this.cupomSignal()?.desconto ?? 0);
  readonly valorTotalFinal = computed(() => Math.max(0, this.valorTotal() - this.desconto()));

  adicionar(pijama: PijamaEcommerce, quantidade: number = 1, variante?: PijamaVariante): void {
    const idVariante = variante?.id;
    const itensAtuais = this.itemsSignal();
    const itemExistente = itensAtuais.find(
      item => item.pijama.id === pijama.id && item.idVariante === idVariante,
    );
    const novosItens = itemExistente
      ? itensAtuais.map(item =>
          item.pijama.id === pijama.id && item.idVariante === idVariante
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item,
        )
      : [
          ...itensAtuais,
          {
            pijama,
            quantidade,
            idVariante,
            varianteInfo: variante
              ? { tamanhoNome: variante.tamanhoNome, corNome: variante.cor?.nome }
              : undefined,
          },
        ];
    this.itemsSignal.set(novosItens);
    this.saveToStorage(novosItens);
  }

  remover(pijamaId: number, idVariante?: number): void {
    const novosItens = this.itemsSignal().filter(
      item => !(item.pijama.id === pijamaId && item.idVariante === idVariante),
    );
    this.itemsSignal.set(novosItens);
    this.saveToStorage(novosItens);
  }

  atualizarQuantidade(pijamaId: number, quantidade: number, idVariante?: number): void {
    if (quantidade <= 0) { this.remover(pijamaId, idVariante); return; }
    const novosItens = this.itemsSignal().map(item =>
      item.pijama.id === pijamaId && item.idVariante === idVariante
        ? { ...item, quantidade }
        : item,
    );
    this.itemsSignal.set(novosItens);
    this.saveToStorage(novosItens);
  }

  limpar(): void {
    this.itemsSignal.set([]);
    this.saveToStorage([]);
    this.removerCupom();
  }

  aplicarCupom(codigo: string, desconto: number): void {
    const c = { codigo, desconto };
    this.cupomSignal.set(c);
    if (typeof localStorage !== 'undefined') localStorage.setItem(this.cupomStorageKey, JSON.stringify(c));
  }

  removerCupom(): void {
    this.cupomSignal.set(null);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(this.cupomStorageKey);
  }

  private loadCupomFromStorage(): CupomAplicado | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.cupomStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.codigo === 'string' && typeof parsed.desconto === 'number') return parsed;
      return null;
    } catch { return null; }
  }

  private loadFromStorage(): CarrinhoItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item): CarrinhoItem | null => {
          if (!item || typeof item !== 'object') return null;
          const candidate = item as Record<string, unknown>;
          const pijama = candidate['pijama'] as PijamaEcommerce | undefined;
          const quantidade = Number(candidate['quantidade'] ?? 0);
          if (!pijama || typeof pijama.id !== 'number' || Number.isNaN(quantidade) || quantidade <= 0) return null;
          const idVariante = candidate['idVariante'] != null ? Number(candidate['idVariante']) : undefined;
          const varianteInfo = candidate['varianteInfo'] as { tamanhoNome: string; corNome?: string } | undefined;
          return { pijama, quantidade, idVariante, varianteInfo };
        })
        .filter((item): item is CarrinhoItem => item !== null);
    } catch { return []; }
  }

  private saveToStorage(items: CarrinhoItem[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}
