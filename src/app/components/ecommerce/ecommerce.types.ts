import { Plano } from '../../models/plano.model';

export type PlanoImagem = {
  fid?: string;
  nomeOriginal?: string;
};

export type PlanoEcommerce = Plano & {
  imagens?: PlanoImagem[];
  arquivos?: PlanoImagem[];
};

export type CarrinhoItem = {
  plano: PlanoEcommerce;
  quantidade: number;
};
