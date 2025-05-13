import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  error = signal<string>('');
  isLoading = signal<boolean>(false);
  
  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit(form: any) {
    if (!form.valid) return;

    const { username, password } = form.value;
    this.isLoading.set(true);

    this.authService.register(username, password).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error.message || 'Registration failed');
        this.isLoading.set(false);
      }
    });
  }
}
