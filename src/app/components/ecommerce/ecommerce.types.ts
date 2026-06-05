import { Pijama } from '../../models/pijama.model';

export type PijamaImagem = {
  fid?: string;
  nomeOriginal?: string;
};

export type PijamaEcommerce = Pijama & {
  imagens?: PijamaImagem[];
};

export type CarrinhoItem = {
  pijama: PijamaEcommerce;
  quantidade: number;
};
