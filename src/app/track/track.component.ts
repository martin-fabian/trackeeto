import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TimeService } from '../services/time.service';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectService } from '../services/project.service';
import { ProjectResponse } from '../interfaces/project-response.interface';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-track',
  imports: [DatePipe, FormsModule],
  templateUrl: './track.component.html',
  styleUrl: './track.component.scss',
  standalone: true,
})
export class TrackComponent implements OnInit {
  private readonly timeService = inject(TimeService);
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly isTimerRunning = signal(false);
  public readonly projects = signal<ProjectResponse[]>([]);
  protected readonly selectedProjectId = signal<number | null>(null);
  private readonly savedProjectId$ = this.timeService.selectedProjectId.asObservable();
  public readonly time = signal<number | undefined>(undefined);

  get projectId(): number | null {
    return this.selectedProjectId();
  }

  set projectId(value: number | null) {
    this.selectedProjectId.set(value);
  }

  public ngOnInit(): void {
    this.projectService
      .getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(projects => {
        this.projects.set(projects);
        if (!this.projectId) {
          this.projectId = this.projects()[0].id;
        }
      });
    this.savedProjectId$.pipe(filter(id => !!id)).subscribe(id => {
      this.listenOnTimeChange(id!);
      this.projectId = id!;
      this.isTimerRunning.set(true);
      console.log('selected project id ', this.selectedProjectId());
    });
  }

  private listenOnTimeChange(id: number): void {
    this.timeService
      .getElapsedTime$(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(time => {
        console.log('time ', time);
        return this.time.set(time);
      });
  }

  public onProjectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value.toString() !== 'Select') {
      this.projectId = Number(selectElement.value);
    } else {
      this.projectId = null;
    }
  }

  public startTimer(): void {
    if (this.projectId) {
      this.isTimerRunning.set(true);
      this.timeService.startTimer(this.selectedProjectId()!);
      this.listenOnTimeChange(this.selectedProjectId()!);
    }
  }

  public stopTimer(): void {
    if (this.projectId) {
      this.isTimerRunning.set(false);
      this.timeService.stopTimer(this.selectedProjectId()!);
    }
  }
}
