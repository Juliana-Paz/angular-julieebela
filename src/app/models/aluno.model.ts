import { Telefone } from "./telefone.model";

export class Aluno {
    id!: number;
    nome!: string;
    sobrenome!: string;
    dataNascimento!: string;
    cpf!: string;
    email!: string;
    telefones!: Telefone[];
}
