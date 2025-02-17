import { Component, inject, input, model } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
  standalone: true,
})
export class TaskFormComponent {
  private readonly taskService = inject(TaskService);
  public readonly projectId = input.required<number>();
  public hideModal = model(true);
  public inputValue = new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(1)]);

  public submit(): void {
    this.taskService.addNewTask(this.projectId(), this.inputValue.value!);
    this.closeModal();
  }

  public closeModal(): void {
    this.hideModal.set(false);
  }
}
