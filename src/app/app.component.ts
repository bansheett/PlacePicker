import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header>
      <img src="logo.png" alt="Stylized globe" />
      <h1>PlacePicker</h1>
      <nav>
        @if (authService.authStatus() && !isAuthPage()) {
          <a routerLink="/places" routerLinkActive="active">Available Places</a>
          <a routerLink="/user-places" routerLinkActive="active">My Places</a>
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
  private router = inject(Router);

  isAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/login' || currentUrl === '/register';
  }

  onLogout() {
    this.authService.logout();
  }
}
