import { signal, Component, OnInit, inject, DestroyRef } from '@angular/core'
import { ProjectResponse } from '../interfaces/project-response.interface'
import { ProjectService } from '../services/project.service'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { TimeService } from '../services/time.service'

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  standalone: true,
})
export class ProjectsComponent implements OnInit {
  public readonly projects = signal<ProjectResponse[]>([])
  private readonly timeService = inject(TimeService)
  private readonly projectService = inject(ProjectService)
  private readonly destroyRef = inject(DestroyRef)
  public readonly isTimerRunningMap = signal(new Map<number, boolean>())

  public ngOnInit(): void {
    this.projectService
      .getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((projects) => this.projects.set(projects))
  }

  public startTimer(id: number): void {
    const mapCopy = new Map(this.isTimerRunningMap())
    mapCopy.set(id, true)
    this.isTimerRunningMap.set(mapCopy) //
    this.timeService.startTimer(id)
  }

  public stopTimer(id: number): void {
    const mapCopy = new Map(this.isTimerRunningMap()) // Kopie mapy
    mapCopy.set(id, false)
    this.isTimerRunningMap.set(mapCopy)
    this.timeService.stopTimer(id)
  }
}
