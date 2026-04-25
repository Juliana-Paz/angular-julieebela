import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-template-adm',
  imports: [RouterOutlet, Header, Footer, Sidebar],
  templateUrl: './template-adm.html',
  styleUrl: './template-adm.css',
})
export class TemplateAdm {
  collapsed = false;
}
