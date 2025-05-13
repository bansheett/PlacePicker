import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

interface AuthResponse {
  token: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = signal<boolean>(false);
  
  authStatus = this.isAuthenticated.asReadonly();

  constructor(private http: HttpClient) {
    // Controlla se c'è già un token salvato
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated.set(true);
    }
  }

  register(username: string, password: string) {
    return this.http.post('http://localhost:3000/register', {
      username,
      password
    });
  }

  login(username: string, password: string) {
    return this.http
      .post<AuthResponse>('http://localhost:3000/login', {
        username,
        password
      })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.isAuthenticated.set(true);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticated.set(false);
  }
}