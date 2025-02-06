import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  title = 'trackeeto';
  isAuthenticated = signal(false);

  public ngOnInit(): void {
    this.authService.isAuthenticated().subscribe(isAuthenticated => this.isAuthenticated.set(isAuthenticated));
  }
}
