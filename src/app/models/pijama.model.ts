import { Arquivo } from './arquivo.model';
import { Categoria } from './categoria.model';
import { Marca } from './marca.model';
import { Estampa } from './estampa.model';
import { Cor } from './cor.model';
import { Material } from './material.model';

export class Pijama {
  id!: number;
  nome!: string;
  descricao!: string;
  preco!: number;
  modelo!: string;
  estoque!: number;
  ativo!: boolean;
  tamanho?: { id: number; nome: string };
  sexo?: { id: number; nome: string };
  categoria?: Categoria;
  marca?: Marca;
  estampa?: Estampa;
  cores?: Cor[];
  materiais?: Material[];
  imagens?: Arquivo[];
}
