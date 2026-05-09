import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Plano } from '../models/plano.model';
import { PlanoService } from '../services/plano.service';

export const planoResolver: ResolveFn<Plano | null> = (route, state) => {

  const id = route.paramMap.get('id');
  const planoService = inject(PlanoService);

  if (id) {
    return planoService.findById(Number(id));
  }
  return null;
};
