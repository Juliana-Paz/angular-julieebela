import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Aluno } from '../models/aluno.model';
import { AlunoService } from '../services/aluno.service';

export const alunoResolver: ResolveFn<Aluno | null> = (route, state) => {

  const id = route.paramMap.get('id');
  const alunoService = inject(AlunoService);

  if (id) {
    return alunoService.findById(id);
  }
  return null;
};
