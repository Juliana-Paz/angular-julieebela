import { Component, OnInit } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { Plano } from '../../../models/plano.model';
import { Arquivo } from '../../../models/arquivo.model';
import { PlanoService } from '../../../services/plano.service';

@Component({
  selector: 'app-plano-form',
  imports: [
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './plano-form.html',
  styleUrl: './plano-form.css',
})
export class PlanoForm implements OnInit {
  readonly form: FormGroup;
  arquivos: Arquivo[] = [];
  arquivosSelecionados: File[] = [];

  constructor(
    private fb: FormBuilder,
    private planoService: PlanoService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(2)]],
      maxAlunos: [null, [Validators.required, Validators.min(1)]],
      maxProfessores: [null, [Validators.required, Validators.min(1)]],
      precoMensal: [null, [Validators.required, Validators.min(0)]],
      descontoAnual: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  ngOnInit(): void {
    const plano = this.activatedRoute.snapshot.data['plano'] as Plano | Record<string, unknown> | null;

    if (plano) {
      this.form.patchValue({
        id: (plano as Plano).id,
        nome: (plano as Plano).nome,
        maxAlunos: (plano as Plano).maxAlunos,
        maxProfessores: (plano as Plano).maxProfessores,
        precoMensal: (plano as Plano).precoMensal,
        descontoAnual: (plano as Plano).descontoAnual,
      });

      this.arquivos = this.normalizarArquivos(plano);
    }
  }

  private normalizarArquivos(plano: Plano | Record<string, unknown>): Arquivo[] {
    const valorBruto = (plano as Record<string, unknown>)['arquivos']
      ?? (plano as Record<string, unknown>)['arquivo']
      ?? (plano as Record<string, unknown>)['imagens']
      ?? (plano as Record<string, unknown>)['imagem']
      ?? (plano as Record<string, unknown>)['arquivosDTO']
      ?? (plano as Record<string, unknown>)['files'];

    const listaBruta = Array.isArray(valorBruto)
      ? valorBruto
      : (valorBruto ? [valorBruto] : []);

    return listaBruta
      .map((item): Arquivo | null => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const arquivo = item as Record<string, unknown>;
        const fid = String(arquivo['fid'] ?? arquivo['fileId'] ?? arquivo['id'] ?? '').trim();

        if (!fid) {
          return null;
        }

        return {
          id: Number(arquivo['id'] ?? 0),
          fid,
          nomeOriginal: String(arquivo['nomeOriginal'] ?? arquivo['nome'] ?? arquivo['fileName'] ?? fid),
          mimeType: String(arquivo['mimeType'] ?? arquivo['contentType'] ?? ''),
          tamanhoBytes: Number(arquivo['tamanhoBytes'] ?? arquivo['size'] ?? 0),
          sha256: String(arquivo['sha256'] ?? ''),
        };
      })
      .filter((arquivo): arquivo is Arquivo => arquivo !== null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.arquivosSelecionados = Array.from(input.files ?? []);
  }

  removerArquivoSelecionado(index: number): void {
    this.arquivosSelecionados = this.arquivosSelecionados.filter((_, i) => i !== index);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const plano = this.form.value as Plano;
    const resultado = plano.id
      ? this.planoService.update(plano.id, plano)
      : this.planoService.create(plano);

    resultado.subscribe({
      next: (planoSalvo) => {
        this.exibirMensagem('Plano salvo com sucesso!');

        if (this.arquivosSelecionados.length > 0 && planoSalvo.id) {
          const uploads = this.arquivosSelecionados.map((arquivo) =>
            this.planoService.uploadImage(planoSalvo.id, arquivo)
          );

          forkJoin(uploads).subscribe({
            next: () => {
              this.exibirMensagem('Arquivos enviados com sucesso!');
              this.router.navigateByUrl('/planos');
            },
            error: () => {
              this.exibirMensagem('Plano salvo, mas ocorreu erro no envio de um ou mais arquivos.');
              this.router.navigateByUrl('/planos');
            }
          });
          return;
        }

        this.router.navigateByUrl('/planos');
      },
      error: () => {
        this.exibirMensagem('Problema ao salvar o plano, entre em contato com o suporte!');
      }
    });
  }

  excluir(): void {
    if (!this.form.value.id) {
      return;
    }

    this.planoService.delete(this.form.value.id).subscribe({
      next: () => {
        this.router.navigateByUrl('/planos');
        this.exibirMensagem('Plano excluído com sucesso!');
      },
      error: () => {
        this.exibirMensagem('Problema ao excluir o plano, entre em contato com o suporte!');
      }
    });
  }

  baixarArquivo(fid: string, nomeOriginal: string): void {
    this.planoService.downloadImage(fid).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeOriginal;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exibirMensagem('Não foi possível baixar o arquivo.');
      }
    });
  }

  removerArquivo(fid: string): void {
    this.planoService.deleteImage(fid).subscribe({
      next: () => {
        this.arquivos = this.arquivos.filter(a => a.fid !== fid);
        this.exibirMensagem('Arquivo removido com sucesso!');
      },
      error: () => {
        this.exibirMensagem('Não foi possível remover o arquivo.');
      }
    });
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
