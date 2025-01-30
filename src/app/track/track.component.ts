import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TimeService } from '../services/time.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectService } from '../services/project.service';
import { ProjectResponse } from '../interfaces/project-response.interface';

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
  public readonly projects = signal<ProjectResponse[]>([]);
  private readonly selectedProjectId = signal<number | null>(null);
  public readonly time = signal<number | undefined>(undefined);

  public ngOnInit(): void {
    this.projectService.getData().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(projects => {
      this.projects.set(projects);
    })
  }

  public onProjectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value.toString() !== "Select") {
      this.selectedProjectId.set(Number(selectElement.value));
    }

    this.timeService.getElapsedTime$(this.selectedProjectId()!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(time => {
      return this.time.set(time)
    })
  }

  public startTimer(): void {
    if (this.selectedProjectId()) {
      this.isTimerRunning.set(true);
      this.timeService.startTimer(this.selectedProjectId()!);
    }
  }

  public stopTimer(): void {
    if (this.selectedProjectId()) {
      this.isTimerRunning.set(false);
      this.timeService.stopTimer(this.selectedProjectId()!);
      this.selectedProjectId.set(null);
    }
  }
}
