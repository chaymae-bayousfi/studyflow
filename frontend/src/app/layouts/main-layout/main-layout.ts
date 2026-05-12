import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../../shared/sidebar/sidebar';

import { NavbarComponent } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-main-layout',

  imports: [
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
  ],

  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
}
