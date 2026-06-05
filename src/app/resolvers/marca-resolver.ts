import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Marca } from '../models/marca.model';
import { MarcaService } from '../services/marca.service';

export const marcaResolver: ResolveFn<Marca> = (route) => {
  return inject(MarcaService).findById(Number(route.paramMap.get('id')));
};
