import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectResponse } from '../interfaces/project-response.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly projectsUrl = 'projects.json'
  private readonly httpClient = inject(HttpClient);

  getData(): Observable<ProjectResponse[]> {
    return this.httpClient.get<ProjectResponse[]>(this.projectsUrl)
  }
}
