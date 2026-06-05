import { Pijama } from './pijama.model';

export class ItemPedido {
  id!: number;
  quantidade!: number;
  precoUnitario!: number;
  subtotal!: number;
  pijama!: Pijama;
}
