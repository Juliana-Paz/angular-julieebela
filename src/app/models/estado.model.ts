import { Regiao } from "./regiao.model";

export class Estado {
    id!: number;
    sigla!: string;
    nome!: string;
    regiao!: Regiao
}
