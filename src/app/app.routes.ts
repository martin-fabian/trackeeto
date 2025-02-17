import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  {
    path: 'project/:id',
    loadComponent: () => import('./project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'task-log/:id',
    loadComponent: () => import('./task-log/task-log.component').then(m => m.TaskLogComponent),
    canActivate: [AuthGuard],
  },

  {
    path: 'projects',
    loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'track',
    loadComponent: () => import('./track/track.component').then(m => m.TrackComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
