import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Cor } from '../models/cor.model';
import { CorService } from '../services/cor.service';

export const corResolver: ResolveFn<Cor> = (route) => {
  return inject(CorService).findById(Number(route.paramMap.get('id')));
};
