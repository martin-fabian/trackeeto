import { signal, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ProjectResponse } from '../interfaces/project-response.interface';
import { ProjectService } from '../services/project.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimeService } from '../services/time.service';
import { filter } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-projects',
  imports: [DatePipe, ProjectFormComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  standalone: true,
})
export class ProjectsComponent implements OnInit {
  public readonly projects = signal<ProjectResponse[]>([]);
  private readonly timeService = inject(TimeService);
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly isTimerRunningMap = signal(new Map<number, boolean>());
  public readonly time = signal<number | undefined>(undefined);
  private readonly savedProjectId$ = this.timeService.selectedProjectId.asObservable();
  protected readonly selectedProjectId = signal<number | null>(null);
  public readonly isAnyProjectRunning = signal(false);
  public readonly showModal = signal(false);

  get projectId(): number | null {
    return this.selectedProjectId();
  }

  set projectId(value: number | null) {
    this.selectedProjectId.set(value);
  }

  public ngOnInit(): void {
    this.projectService.projects$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(projects => this.projects.set(projects));

    this.listenOnTimeChange();

    this.savedProjectId$.pipe(filter(id => !!id)).subscribe(id => {
      this.projectId = id!;
      const mapCopy = new Map(this.isTimerRunningMap());
      mapCopy.set(id!, true);
      this.isTimerRunningMap.set(mapCopy);
      this.isAnyProjectRunning.set(true);
    });
  }

  public hideModal(): void {
    this.showModal.set(false);
  }

  public openModal(): void {
    this.showModal.set(true);
  }

  private listenOnTimeChange(): void {
    this.timeService.getElapsedTime$().subscribe(time => {
      this.time.set(time);
    });
  }

  public removeProject(id: number): void {
    this.projectService.removeProject(id);
  }

  public startTimer(id: number): void {
    let runningProjectId: number | null = null;
    for (const [projectId, isRunning] of this.isTimerRunningMap().entries()) {
      if (isRunning) {
        runningProjectId = projectId;
        break;
      }
    }

    if (runningProjectId !== null) {
      this.stopTimer(runningProjectId);
    }

    const mapCopy = new Map(this.isTimerRunningMap());
    mapCopy.set(id, true);
    this.isTimerRunningMap.set(mapCopy);
    this.timeService.startTimer(id);
  }

  public stopTimer(id: number): void {
    const mapCopy = new Map(this.isTimerRunningMap()); // Kopie mapy
    mapCopy.set(id, false);
    this.isTimerRunningMap.set(mapCopy);

    const project = this.projects().find(p => p.id === id);
    if (!project || !this.time()) {
      return;
    }
    const updatedProject: ProjectResponse = {
      ...project,
      startDateTime: project.startDateTime !== undefined ? project.startDateTime : new Date(),
      endDateTime: new Date(),
      duration: Math.round(project.duration + this.time()!),
    };

    this.timeService.stopTimer(id);
    this.projectService.updateProject(updatedProject);
    this.time.set(0);
    this.isAnyProjectRunning.set(false);
  }

  public onKeyPress(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    const regex = /^[0-9]+$/;

    if (!regex.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  public onBlur(event: FocusEvent, projectId: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '');

    const match = value.match(/^(\d{0,2}):?(\d{0,2})?:?(\d{0,2})?$/);

    if (match) {
      const hours = parseInt(match[1] || '0', 10);
      const minutes = parseInt(match[2] || '0', 10);
      const seconds = parseInt(match[3] || '0', 10);

      input.value = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      const newDuration = (hours * 3600 + minutes * 60 + seconds) * 1000;

      const project = this.projects().find(p => p.id === projectId);

      if (project && project.endDateTime) {
        const oldDuration = project.duration;
        const diff = newDuration - oldDuration;

        project.endDateTime = new Date(project.endDateTime.getTime() + diff);
        project.startDateTime = new Date(project.endDateTime.getTime() - newDuration);

        const now = new Date();
        if (project.endDateTime > now) {
          project.endDateTime = now;
          project.startDateTime = new Date(now.getTime() - newDuration);
        }
      } else {
        const now = new Date();
        project!.endDateTime = now;
        project!.startDateTime = new Date(now.getTime() - newDuration);
      }

      const updatedProject: ProjectResponse = {
        ...project!,
        duration: newDuration,
      };

      this.projectService.updateProject(updatedProject);
    } else {
      input.value = '00:00:00';
    }

    this.time.set(Number(input.value));
  }
}
