import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './Modules/dashboard/dashboard.component';
import { FooterComponent } from './Modules/footer/footer.component';
import { NavBarComponent } from './Modules/nav-bar/nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,DashboardComponent,FooterComponent,NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'DashBoard';
}
