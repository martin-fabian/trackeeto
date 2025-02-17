import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeService } from '../services/time.service';
import { DatePipe, NgClass } from '@angular/common';
import { of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-menu',
  imports: [RouterLink, DatePipe, NgClass],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss',
  standalone: true,
})
export class MainMenuComponent implements OnInit {
  private readonly timeService = inject(TimeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectedTaskId$ = this.timeService.selectedTaskId.asObservable();
  public readonly time = signal<number | undefined>(undefined);
  private readonly authService = inject(AuthService);
  public readonly showMenuIcon = signal(false);

  public ngOnInit(): void {
    this.selectedTaskId$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(id => (id !== undefined ? this.timeService.getElapsedTime$() : of(0))),
      )
      .subscribe(time => this.time.set(time));
  }

  public logout(): void {
    this.authService.logout();
  }

  public setClass(): void {
    this.showMenuIcon.set(!this.showMenuIcon());
  }
}
