import { Routes } from '@angular/router';
import { EstadoList } from './components/adm/estado/estado-list/estado-list';
import { EstadoForm } from './components/adm/estado/estado-form/estado-form';
import { estadoResolver } from './resolvers/estado-resolver';
import { MunicipioList } from './components/adm/municipio/municipio-list/municipio-list';
import { MunicipioForm } from './components/adm/municipio/municipio-form/municipio-form';
import { municipioResolver } from './resolvers/municipio-resolver';
import { AlunoList } from './components/adm/aluno/aluno-list/aluno-list';
import { AlunoForm } from './components/adm/aluno/aluno-form/aluno-form';
import { alunoResolver } from './resolvers/aluno-resolver';
import { TemplateAdm } from './components/template-adm/template-adm';
import { Dashboard } from './components/adm/dashboard/dashboard';
import { PlanoList } from './components/adm/plano/plano-list/plano-list';
import { PlanoForm } from './components/adm/plano/plano-form/plano-form';
import { planoResolver } from './resolvers/plano-resolver';
import { Home } from './components/ecommerce/home/home';
import { DetalhePlano } from './components/ecommerce/detalhe-plano/detalhe-plano';
import { Carrinho } from './components/ecommerce/carrinho/carrinho';
import { Perfil } from './components/ecommerce/perfil/perfil';
import { Login } from './components/ecommerce/login/login';
import { TemplateEcommerce } from './components/template-ecommerce/template-ecommerce';
import { authGuard } from './guards/auth.guard';
import { roleChildGuard, roleGuard } from './guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        component: TemplateEcommerce,
        children: [
            {path: '', component: Home, title: 'Home'},
            {path: 'detalhe-plano/:id', component: DetalhePlano, title: 'Detalhe do Plano',
                resolve: {plano: planoResolver} },
            {path: 'carrinho', component: Carrinho, title: 'Carrinho'},
            {path: 'perfil', component: Perfil, title: 'Meu Perfil', canActivate: [authGuard]},
            {path: 'login', component: Login, title: 'Login'},
        ]
    },
    {
        path: 'adm',
        component: TemplateAdm,
        canActivate: [roleGuard],
        canActivateChild: [roleChildGuard],
        data: { roles: ['Adm'] },
        children: [
            {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
            {path: 'dashboard', component: Dashboard, title: 'Dashboard'},
            {path: 'estados', component: EstadoList, title: 'Listagem de Estados'},
            {path: 'estados/new', component: EstadoForm, title: 'Cadastro de Estado'},
            {path: 'estados/edit/:id', component: EstadoForm, title: 'Edição de Estado',
                resolve: {estado: estadoResolver} },
            {path: 'municipios', component: MunicipioList, title: 'Listagem de Municípios'},
            {path: 'alunos', component: AlunoList, title: 'Listagem de Alunos'},
            {path: 'alunos/new', component: AlunoForm, title: 'Cadastro de Aluno'},
            {path: 'alunos/edit/:id', component: AlunoForm, title: 'Edição de Aluno',
                resolve: {aluno: alunoResolver} },
            {path: 'planos', component: PlanoList, title: 'Listagem de Planos'},
            {path: 'planos/new', component: PlanoForm, title: 'Cadastro de Plano'},
            {path: 'planos/edit/:id', component: PlanoForm, title: 'Edição de Plano',
                resolve: {plano: planoResolver} },
            {path: 'municipios/new', component: MunicipioForm, title: 'Cadastro de Município'},
            {path: 'municipios/edit/:id', component: MunicipioForm, title: 'Edição de Município',
                resolve: {municipio: municipioResolver} },
        ]
    },
];


