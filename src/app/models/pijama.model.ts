import { Arquivo } from './arquivo.model';
import { Categoria } from './categoria.model';
import { Marca } from './marca.model';
import { Estampa } from './estampa.model';
import { Material } from './material.model';

export interface PijamaVariante {
  id: number;
  tamanhoId: string;
  tamanhoNome: string;
  cor: { id: number; nome: string; hexadecimal: string } | null;
  estoque: number;
}

export class Pijama {
  id!: number;
  nome!: string;
  descricao!: string;
  preco!: number;
  modelo!: string;
  ativo!: boolean;
  sexo?: { id: number; nome: string };
  categoria?: Categoria;
  marca?: Marca;
  estampa?: Estampa;
  materiais?: Material[];
  imagens?: Arquivo[];
  variantes?: PijamaVariante[];
}
