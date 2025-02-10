import { Component, inject, model } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
  standalone: true,
})
export class ProjectFormComponent {
  private readonly projectService = inject(ProjectService);
  public hideModal = model(true);
  public inputValue = new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(1)]);

  public submit(): void {
    this.projectService.addNewProject(this.inputValue.value!);
    this.closeModal();
  }

  public closeModal(): void {
    this.hideModal.set(false);
  }
}
