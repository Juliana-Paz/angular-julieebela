import { Arquivo } from './arquivo.model';

export class Plano {
    id!: number;
    nome!: string;
    maxAlunos!: number;
    maxProfessores!: number;
    precoMensal!: number;
    descontoAnual!: number;
    arquivos!: Arquivo[];
}