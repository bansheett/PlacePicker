import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header>
      <img src="logo.png" alt="Stylized globe" />
      <h1>PlacePicker</h1>
      <nav>
        @if (authService.authStatus()) {
          <a routerLink="/places">Available Places</a>
          <a routerLink="/user-places">My Places</a>
          <button (click)="onLogout()">Logout</button>
        }
      </nav>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  protected authService = inject(AuthService);

  onLogout() {
    this.authService.logout();
  }
}
