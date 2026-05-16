export interface PerfilUsuario {
  id: number;
  nome: string;
}

export interface Usuario {
  id: number;
  nome: string;
  username: string;
  perfil: PerfilUsuario;
}