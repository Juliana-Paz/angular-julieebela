import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Categoria } from '../models/categoria.model';
import { CategoriaService } from '../services/categoria.service';

export const categoriaResolver: ResolveFn<Categoria> = (route) => {
  return inject(CategoriaService).findById(Number(route.paramMap.get('id')));
};
