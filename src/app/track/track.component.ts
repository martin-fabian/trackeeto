import { Component, inject, OnInit, signal } from '@angular/core';
import { TimeService } from '../services/time.service';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../services/project.service';
import { ProjectResponse } from '../interfaces/project-response.interface';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';

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
    this.projectService.projects$.subscribe(projects => {
      this.projects.set(projects);
      if (!this.projectId && this.projects().length > 0) {
        this.projectId = this.projects()[0]!.id;
      }
    });
    this.listenOnTimeChange();
    this.savedProjectId$.pipe(filter(id => !!id)).subscribe(id => {
      this.projectId = id!;
      this.isTimerRunning.set(true);
    });
  }

  private listenOnTimeChange(): void {
    this.timeService.getElapsedTime$().subscribe(time => {
      this.time.set(time);
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
      this.listenOnTimeChange();
    }
  }

  public stopTimer(): void {
    if (!this.projectId) {
      return;
    }
    this.isTimerRunning.set(false);
    const elapsedTime = this.time();
    const project = this.projects().find(p => p.id === this.projectId);

    if (project && elapsedTime) {
      const updatedProject: ProjectResponse = {
        ...project,
        endDateTime: new Date(),
        duration: Math.round(project.duration + elapsedTime),
      };

      this.timeService.stopTimer(this.selectedProjectId()!);
      this.projectService.updateProject(updatedProject);
    }
    this.time.set(0);
  }
}
