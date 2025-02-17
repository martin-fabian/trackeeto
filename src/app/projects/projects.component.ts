import { signal, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ProjectResponse } from '../interfaces/project-response.interface';
import { ProjectService } from '../services/project.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  imports: [DatePipe, ProjectFormComponent, RouterLink, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  standalone: true,
})
export class ProjectsComponent implements OnInit {
  public readonly projects = signal<ProjectResponse[]>([]);
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly isTimerRunningMap = signal(new Map<number, boolean>());
  public readonly time = signal<number | undefined>(undefined);
  protected readonly selectedProjectId = signal<number | null>(null);
  public readonly isAnyProjectRunning = signal(false);
  public readonly showModal = signal(false);
  public readonly maxNameLength = 10;

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
  }

  public hideModal(): void {
    this.showModal.set(false);
  }

  public openModal(): void {
    this.showModal.set(true);
  }

  public removeProject(event: Event, id: number): void {
    event.stopPropagation();
    this.projectService.removeProject(id);
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
