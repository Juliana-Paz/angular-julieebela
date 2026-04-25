import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  kpis = [
    { title: 'Total Academias', value: '42', trend: '+2 este mes', icon: 'domain' },
    { title: 'Total Alunos', value: '12.840', trend: '+12,4%', icon: 'group' },
    { title: 'Matriculas Ativas', value: '10.215', trend: 'Estavel', icon: 'assignment_ind' },
    { title: 'Receita Mensal', value: 'R$ 842k', trend: '+R$ 54k', icon: 'payments' },
  ];

  planosPopulares = [
    { nome: 'Black Anual', preco: 'R$ 1.200,00', percentual: 45, sigla: 'VIP' },
    { nome: 'Plano Mensal', preco: 'R$ 149,90', percentual: 32, sigla: 'STD' },
    { nome: 'Plano Fit', preco: 'R$ 99,90', percentual: 23, sigla: 'FIT' },
  ];

  meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];

}
