import { signal, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ProjectResponse } from '../interfaces/project-response.interface';
import { ProjectService } from '../services/project.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task.service';
import { TaskResponse } from '../interfaces/task-response.interface';

@Component({
  selector: 'app-projects',
  imports: [DatePipe, ProjectFormComponent, RouterLink, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  standalone: true,
})
export class ProjectsComponent implements OnInit {
  public readonly projects = signal<ProjectResponse[]>([]);
  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly isTimerRunningMap = signal(new Map<number, boolean>());
  public readonly time = signal<number | undefined>(undefined);
  protected readonly selectedProjectId = signal<number | null>(null);
  public readonly isAnyProjectRunning = signal(false);
  public readonly showProjectForm = signal(false);
  public readonly maxNameLength = 10;
  public readonly tasks = signal<TaskResponse[]>([]);
  public readonly showModal = signal(false);
  public readonly projectIdForDeletion = signal<number | undefined>(undefined);

  get projectId(): number | null {
    return this.selectedProjectId();
  }

  set projectId(value: number | null) {
    this.selectedProjectId.set(value);
  }

  public ngOnInit(): void {
    // TODO possible connection both streams together forkJoin and move to method
    this.projectService.projects$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(projects => this.projects.set(projects));

    this.taskService.allTasks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tasks => {
      this.tasks.set(tasks);
    });
  }

  public hideProjectForm(): void {
    this.showProjectForm.set(false);
  }

  public openProjectForm(): void {
    this.showProjectForm.set(true);
  }

  public removeProject(event: Event, id: number): void {
    this.projectIdForDeletion.set(id);
    event.stopPropagation();
    const isAnyExistingTask = this.tasks().some(task => task.projectId === id);
    if (isAnyExistingTask) {
      this.showModal.set(true);
    } else {
      this.projectIdForDeletion.set(undefined);
      this.projectService.removeProject(id);
    }
  }

  public confirm(): void {
    this.projectService.removeProject(this.projectIdForDeletion()!);
    this.projectIdForDeletion.set(undefined);
    this.showModal.set(false);
  }

  public cancel(): void {
    this.showModal.set(false);
  }

  public stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  public onBlur(event: FocusEvent, projectId: number): void {
    const input = event.target as HTMLInputElement;

    if (input.value.length > this.maxNameLength) {
      return;
    }
    const project = this.projects().find(p => p.id === projectId);
    if (!project) {
      return;
    }
    project.name = input.value;
    this.projectService.updateProject(project);
  }
}
