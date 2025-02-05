import { Routes } from '@angular/router';

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
];
