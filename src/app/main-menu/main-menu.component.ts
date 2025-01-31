import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TimeService } from '../services/time.service'
import { DatePipe } from '@angular/common'
import { of, switchMap } from 'rxjs'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

@Component({
  selector: 'app-main-menu',
  imports: [RouterLink, DatePipe],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss',
  standalone: true,
})
export class MainMenuComponent implements OnInit {
  private readonly timeService = inject(TimeService)
  private readonly destroyRef = inject(DestroyRef)
  private readonly selectedProjectId$ = this.timeService.selectedProjectId.asObservable()
  public readonly time = signal<number | undefined>(undefined)

  public ngOnInit(): void {
    this.selectedProjectId$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((id) => (id !== undefined ? this.timeService.getElapsedTime$(id) : of(0))),
      )
      .subscribe((time) => this.time.set(time))
  }
}
