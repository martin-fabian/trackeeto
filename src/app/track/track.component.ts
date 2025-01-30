import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TimeService } from '../services/time.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-track',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './track.component.html',
  styleUrl: './track.component.scss',
  standalone: true
})
export class TrackComponent implements OnInit {
  private readonly timeService = inject(TimeService);
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly isTimerRunning = signal(false);
  public readonly time$ = this.timeService.elapsedTime$;
  public readonly projects = toSignal(this.projectService.getData());
  public readonly projectNames = signal<string[]>([]);

  public ngOnInit(): void {
    this.time$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(time => this.isTimerRunning.set(time > 0))
    const projectNames: string[] = this.projects()?.map(project => project.name)!
    this.projectNames.set(projectNames)
  }

  public startTimer(): void {
    this.isTimerRunning.set(true);
    this.timeService.startTimer();
  }

  public stopTimer(): void {
    this.isTimerRunning.set(false);
    this.timeService.stopTimer();
  }
}
