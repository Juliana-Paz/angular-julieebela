import { ItemPedido } from './item-pedido.model';

export interface StatusPedido { id: number; nome: string; }
export interface FormaPagamentoPedido { id: number; nome: string; }

export class Pedido {
  id!: number;
  data!: string;
  total!: number;
  valorDesconto!: number;
  status!: StatusPedido | string;
  formaPagamento!: FormaPagamentoPedido | string;
  itens!: ItemPedido[];
}
