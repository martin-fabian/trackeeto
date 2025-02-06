import { inject, Injectable } from '@angular/core';
import { LoginRequest } from '../interfaces/login-request.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private readonly router = inject(Router);

  public isAuthenticated(): Observable<boolean> {
    return this.isLoggedIn.asObservable();
  }

  public login(login: LoginRequest): void {
    if (login.email === 'test@test.cz' && login.password === 'test') {
      this.isLoggedIn.next(true);
      this.router.navigate(['/projects']);
    }
  }

  public logout(): void {
    this.isLoggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
