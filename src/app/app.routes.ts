import { Routes } from '@angular/router';
import { EstadoList } from './components/adm/estado/estado-list/estado-list';
import { EstadoForm } from './components/adm/estado/estado-form/estado-form';
import { estadoResolver } from './resolvers/estado-resolver';
import { MunicipioList } from './components/adm/municipio/municipio-list/municipio-list';
import { MunicipioForm } from './components/adm/municipio/municipio-form/municipio-form';
import { municipioResolver } from './resolvers/municipio-resolver';
import { TemplateAdm } from './components/template-adm/template-adm';
import { TemplateAuth } from './components/template-auth/template-auth';
import { Dashboard } from './components/adm/dashboard/dashboard';
import { Home } from './components/ecommerce/home/home';
import { Carrinho } from './components/ecommerce/carrinho/carrinho';
import { Perfil } from './components/ecommerce/perfil/perfil';
import { Login } from './components/ecommerce/login/login';
import { TemplateEcommerce } from './components/template-ecommerce/template-ecommerce';
import { PijamaList } from './components/adm/pijama/pijama-list/pijama-list';
import { PijamaForm } from './components/adm/pijama/pijama-form/pijama-form';
import { pijamaResolver } from './resolvers/pijama-resolver';
import { CategoriaList } from './components/adm/categoria/categoria-list/categoria-list';
import { CategoriaForm } from './components/adm/categoria/categoria-form/categoria-form';
import { categoriaResolver } from './resolvers/categoria-resolver';
import { MarcaList } from './components/adm/marca/marca-list/marca-list';
import { MarcaForm } from './components/adm/marca/marca-form/marca-form';
import { marcaResolver } from './resolvers/marca-resolver';
import { CorList } from './components/adm/cor/cor-list/cor-list';
import { CorForm } from './components/adm/cor/cor-form/cor-form';
import { corResolver } from './resolvers/cor-resolver';
import { MaterialList } from './components/adm/material/material-list/material-list';
import { MaterialForm } from './components/adm/material/material-form/material-form';
import { materialResolver } from './resolvers/material-resolver';
import { CupomList } from './components/adm/cupom/cupom-list/cupom-list';
import { CupomForm } from './components/adm/cupom/cupom-form/cupom-form';
import { cupomResolver } from './resolvers/cupom-resolver';
import { DetalhePijama } from './components/ecommerce/detalhe-pijama/detalhe-pijama';
import { Checkout } from './components/ecommerce/checkout/checkout';
import { PedidoConfirmado } from './components/ecommerce/pedido-confirmado/pedido-confirmado';
import { Cadastro } from './components/ecommerce/cadastro/cadastro';
import { ListaDesejos } from './components/ecommerce/lista-desejos/lista-desejos';
import { RecuperarSenha } from './components/ecommerce/recuperar-senha/recuperar-senha';
import { AdmPerfil } from './components/adm/adm-perfil/adm-perfil';
import { authGuard } from './guards/auth.guard';
import { roleChildGuard, roleGuard } from './guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        component: TemplateEcommerce,
        children: [
            { path: '', component: Home, title: 'Home' },
            { path: 'detalhe-pijama/:id', component: DetalhePijama, title: 'Detalhe do Pijama',
              resolve: { pijama: pijamaResolver } },
            { path: 'carrinho', component: Carrinho, title: 'Carrinho' },
            { path: 'checkout', component: Checkout, title: 'Checkout', canActivate: [authGuard] },
            { path: 'pedido-confirmado/:id', component: PedidoConfirmado, title: 'Pedido Confirmado', canActivate: [authGuard] },
            { path: 'lista-desejos', component: ListaDesejos, title: 'Lista de Desejos', canActivate: [authGuard] },
        ]
    },
    {
        path: '',
        component: TemplateAuth,
        children: [
            { path: 'login', component: Login, title: 'Login' },
            { path: 'cadastro', component: Cadastro, title: 'Cadastro' },
            { path: 'recuperar-senha', component: RecuperarSenha, title: 'Recuperar Senha' },
            { path: 'perfil', component: Perfil, title: 'Meu Perfil', canActivate: [authGuard] },
        ]
    },
    {
        path: 'adm',
        component: TemplateAdm,
        canActivate: [roleGuard],
        canActivateChild: [roleChildGuard],
        data: { roles: ['Adm'] },
        children: [
            { path: '', pathMatch: 'full', redirectTo: '/adm/dashboard' },
            { path: 'dashboard', component: Dashboard, title: 'Dashboard' },
            { path: 'pijamas', component: PijamaList, title: 'Listagem de Pijamas' },
            { path: 'pijamas/new', component: PijamaForm, title: 'Cadastro de Pijama' },
            { path: 'pijamas/edit/:id', component: PijamaForm, title: 'Edição de Pijama',
              resolve: { pijama: pijamaResolver } },
            { path: 'categorias', component: CategoriaList, title: 'Listagem de Categorias' },
            { path: 'categorias/new', component: CategoriaForm, title: 'Cadastro de Categoria' },
            { path: 'categorias/edit/:id', component: CategoriaForm, title: 'Edição de Categoria',
              resolve: { categoria: categoriaResolver } },
            { path: 'marcas', component: MarcaList, title: 'Listagem de Marcas' },
            { path: 'marcas/new', component: MarcaForm, title: 'Cadastro de Marca' },
            { path: 'marcas/edit/:id', component: MarcaForm, title: 'Edição de Marca',
              resolve: { marca: marcaResolver } },
            { path: 'cores', component: CorList, title: 'Listagem de Cores' },
            { path: 'cores/new', component: CorForm, title: 'Cadastro de Cor' },
            { path: 'cores/edit/:id', component: CorForm, title: 'Edição de Cor',
              resolve: { cor: corResolver } },
            { path: 'materiais', component: MaterialList, title: 'Listagem de Materiais' },
            { path: 'materiais/new', component: MaterialForm, title: 'Cadastro de Material' },
            { path: 'materiais/edit/:id', component: MaterialForm, title: 'Edição de Material',
              resolve: { material: materialResolver } },
            { path: 'cupons', component: CupomList, title: 'Listagem de Cupons' },
            { path: 'cupons/new', component: CupomForm, title: 'Cadastro de Cupom' },
            { path: 'cupons/edit/:id', component: CupomForm, title: 'Edição de Cupom',
              resolve: { cupom: cupomResolver } },
            { path: 'estados', component: EstadoList, title: 'Listagem de Estados' },
            { path: 'estados/new', component: EstadoForm, title: 'Cadastro de Estado' },
            { path: 'estados/edit/:id', component: EstadoForm, title: 'Edição de Estado',
                resolve: { estado: estadoResolver } },
            { path: 'municipios', component: MunicipioList, title: 'Listagem de Municípios' },
            { path: 'municipios/new', component: MunicipioForm, title: 'Cadastro de Município' },
            { path: 'municipios/edit/:id', component: MunicipioForm, title: 'Edição de Município',
                resolve: { municipio: municipioResolver } },
            { path: 'perfil', component: AdmPerfil, title: 'Meu Perfil' },
        ]
    },
];
