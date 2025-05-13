import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  error = signal<string>('');
  isLoading = signal<boolean>(false);
  
  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit(form: any) {
    if (!form.valid) return;

    const { username, password } = form.value;
    this.isLoading.set(true);

    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/places']);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Authentication failed');
        this.isLoading.set(false);
      }
    });
  }
}