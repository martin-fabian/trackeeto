import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-form',
  imports: [FormsModule],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
  standalone: true,
})
export class ProjectFormComponent {
  private readonly projectService = inject(ProjectService);
  hideModal = model(true);
  inputValue = '';

  public submit(): void {
    this.projectService.addNewProject(this.inputValue);
    this.closeModal();
  }

  public closeModal(): void {
    this.hideModal.set(false);
  }
}
