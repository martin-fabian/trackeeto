import { signal, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ProjectResponse } from '../interfaces/project-response.interface';
import { ProjectService } from '../services/project.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  standalone: true
})
export class ProjectsComponent implements OnInit {
  public readonly projects = signal<ProjectResponse[]>([]);
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.projectService.getData().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(projects => this.projects.set(projects))
  }
}
