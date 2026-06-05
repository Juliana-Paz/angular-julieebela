import { Telefone } from './telefone.model';
import { Endereco } from './endereco.model';
import { Usuario } from './usuario.model';

export class Cliente {
  id!: number;
  nome!: string;
  cpf!: string;
  email!: string;
  dataNascimento!: string;
  telefones!: Telefone[];
  enderecos!: Endereco[];
  usuario!: Usuario;
}
