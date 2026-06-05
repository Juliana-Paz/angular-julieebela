import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Pijama } from '../models/pijama.model';
import { PijamaService } from '../services/pijama.service';

export const pijamaResolver: ResolveFn<Pijama> = (route) => {
  return inject(PijamaService).findById(Number(route.paramMap.get('id')));
};
