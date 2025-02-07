import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ProjectResponse } from '../interfaces/project-response.interface';
import { ProjectRequest } from '../interfaces/project-request.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly projectsUrl = 'projects.json';
  private readonly httpClient = inject(HttpClient);
  private projectsSubject = new BehaviorSubject<ProjectResponse[]>([]);
  public readonly projects$ = this.projectsSubject.asObservable();
  private readonly allProjects = signal<ProjectResponse[]>([]);

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
      .subscribe(allProjects => this.allProjects.set(allProjects));
  }

  private mergeWithLocalStorage(projects: ProjectResponse[]): ProjectResponse[] {
    const storedProjects: string | null = localStorage.getItem('projects');
    if (storedProjects === null) {
      return projects;
    }

    const parsedStoredProjects: ProjectResponse[] = JSON.parse(storedProjects);

    const mergedProjects = projects.map(project => {
      const storedProject = parsedStoredProjects.find(p => p.id === project.id);
      return storedProject ? { ...project, ...storedProject } : project;
    });

    const newProjects = parsedStoredProjects.filter(storedProject => !projects.some(p => p.id === storedProject.id));

    return [...mergedProjects, ...newProjects];
  }

  public removeProject(id: number): void {
    const updatedProjects = this.allProjects().filter(project => project.id !== id);
    this.allProjects.set(updatedProjects);
    this.saveToLocalStorage(updatedProjects);
    this.projectsSubject.next(updatedProjects);
  }

  public updateProject(updatedProject: ProjectResponse): void {
    const storedProjects: string | null = localStorage.getItem('projects');
    const projects: ProjectResponse[] = storedProjects !== null ? JSON.parse(storedProjects) : [];

    const updatedProjects = projects.map(p => (p.id === updatedProject.id ? updatedProject : p));
    this.saveToLocalStorage(updatedProjects);
    this.projectsSubject.next(updatedProjects);
  }

  private saveToLocalStorage(projects: ProjectResponse[]): void {
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  public addNewProject(name: string): void {
    const sortedProjects = this.allProjects().sort((a, b) => a.id - b.id);
    let lastId = sortedProjects.length > 0 ? sortedProjects[sortedProjects.length - 1].id : 1;

    const newProject: ProjectRequest = {
      id: lastId + 1,
      name: name,
      duration: 0,
      startDateTime: undefined,
      endDateTime: undefined,
    };
    this.updateProjects(newProject);
  }

  private updateProjects(newProject: ProjectRequest): void {
    const projectResponseFromRequest: ProjectResponse = {
      id: newProject.id!,
      name: newProject.name,
      duration: newProject.duration,
      startDateTime: newProject.startDateTime,
      endDateTime: newProject.endDateTime,
    };
    const actualProjects = [...this.allProjects(), projectResponseFromRequest];
    this.allProjects.set(actualProjects);
    this.saveToLocalStorage(actualProjects);
    this.projectsSubject.next(actualProjects);
  }
}
