import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

interface TokenTemporarioResponse {
  tokenTemporario: string;
}

@Injectable({ providedIn: 'root' })
export class RecuperacaoSenhaService {
  private readonly api = 'http://localhost:8080/recuperacao-senha';
  private readonly http = inject(HttpClient);

  solicitar(email: string): Observable<any> {
    return this.http.post(`${this.api}/solicitar`, { email }, { observe: 'response' });
  }

  verificarCodigo(codigo: string): Observable<TokenTemporarioResponse> {
    return this.http.post<TokenTemporarioResponse>(`${this.api}/verificar-codigo`, { codigo });
  }

  redefinirSenha(tokenTemporario: string, novaSenha: string): Observable<void> {
    return this.http.post<void>(`${this.api}/redefinir`, { tokenTemporario, novaSenha });
  }
}
