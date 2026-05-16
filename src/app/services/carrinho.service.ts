import { computed, Injectable, signal } from '@angular/core';
import { CarrinhoItem, PlanoEcommerce } from '../components/ecommerce/ecommerce.types';

@Injectable({
  providedIn: 'root',
})
export class CarrinhoService {
  private readonly storageKey = 'sga-ecommerce-carrinho';
  private readonly itemsSignal = signal<CarrinhoItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();
  readonly quantidadeTotal = computed(() =>
    this.itemsSignal().reduce((total, item) => total + item.quantidade, 0),
  );
  readonly valorTotal = computed(() =>
    this.itemsSignal().reduce((total, item) => total + item.plano.precoMensal * item.quantidade, 0),
  );

  adicionar(plano: PlanoEcommerce): void {
    const itensAtuais = this.itemsSignal();
    const itemExistente = itensAtuais.find(item => item.plano.id === plano.id);

    const novosItens = itemExistente
      ? itensAtuais.map(item =>
          item.plano.id === plano.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        )
      : [...itensAtuais, { plano, quantidade: 1 }];

    this.itemsSignal.set(novosItens);
    this.saveToStorage(novosItens);
  }

  remover(planoId: number): void {
    const novosItens = this.itemsSignal().filter(item => item.plano.id !== planoId);
    this.itemsSignal.set(novosItens);
    this.saveToStorage(novosItens);
  }

  limpar(): void {
    this.itemsSignal.set([]);
    this.saveToStorage([]);
  }

  private loadFromStorage(): CarrinhoItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((item): CarrinhoItem | null => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const candidate = item as Record<string, unknown>;
          const plano = candidate['plano'] as PlanoEcommerce | undefined;
          const quantidade = Number(candidate['quantidade'] ?? 0);

          if (!plano || typeof plano.id !== 'number' || Number.isNaN(quantidade) || quantidade <= 0) {
            return null;
          }

          return { plano, quantidade };
        })
        .filter((item): item is CarrinhoItem => item !== null);
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CarrinhoItem[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}
