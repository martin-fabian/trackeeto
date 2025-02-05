import { Routes } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'projects',
  },
  {
    path: 'projects',
    loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent),
  },
  {
    path: 'track',
    loadComponent: () => import('./track/track.component').then(m => m.TrackComponent),
  },
  {
    path: 'new-project',
    loadComponent: () => import('./project-form/project-form.component').then(m => m.ProjectFormComponent),
  },
];
