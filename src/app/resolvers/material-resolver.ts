import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Material } from '../models/material.model';
import { MaterialService } from '../services/material.service';

export const materialResolver: ResolveFn<Material> = (route) => {
  return inject(MaterialService).findById(Number(route.paramMap.get('id')));
};
