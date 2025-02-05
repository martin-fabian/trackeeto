import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { ProjectResponse } from '../interfaces/project-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly projectsUrl = 'projects.json';
  private readonly httpClient = inject(HttpClient);
  private projectsSubject = new BehaviorSubject<ProjectResponse[]>([]);
  public readonly projects$ = this.projectsSubject.asObservable();

  constructor() {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.httpClient
      .get<ProjectResponse[]>(this.projectsUrl)
      .pipe(
        map(projects => this.mergeWithLocalStorage(projects)),
        tap(projects => this.projectsSubject.next(projects)),
        tap(projects => this.saveToLocalStorage(projects)),
      )
      .subscribe();
  }

  private mergeWithLocalStorage(projects: ProjectResponse[]): ProjectResponse[] {
    const storedProjects = localStorage.getItem('projects');
    if (!storedProjects) {
      return projects;
    }

    const parsedStoredProjects: ProjectResponse[] = JSON.parse(storedProjects);

    return projects.map(project => {
      const storedProject = parsedStoredProjects.find(p => p.id === project.id);
      return storedProject ? { ...project, ...storedProject } : project;
    });
  }

  private saveToLocalStorage(projects: ProjectResponse[]): void {
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  public updateProject(updatedProject: ProjectResponse): void {
    const storedProjects = localStorage.getItem('projects');
    const projects: ProjectResponse[] = storedProjects ? JSON.parse(storedProjects) : [];

    const updatedProjects = projects.map(p => (p.id === updatedProject.id ? updatedProject : p));
    this.saveToLocalStorage(updatedProjects);
    this.projectsSubject.next(updatedProjects);
  }
}
