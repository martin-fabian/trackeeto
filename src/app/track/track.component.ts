import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TimeService } from '../services/time.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskService } from '../services/task.service';
import { TaskResponse } from '../interfaces/task-response.interface';

@Component({
  selector: 'app-track',
  imports: [DatePipe, FormsModule],
  templateUrl: './track.component.html',
  styleUrl: './track.component.scss',
  standalone: true,
})
export class TrackComponent implements OnInit {
  private readonly timeService = inject(TimeService);
  private readonly taskService = inject(TaskService);
  public readonly isTimerRunning = signal(false);
  public readonly tasks = signal<TaskResponse[]>([]);
  protected readonly selectedTaskId = signal<number | null>(null);
  public readonly time = signal<number | undefined>(undefined);
  private readonly destroyRef = inject(DestroyRef);

  get taskId(): number | null {
    return this.selectedTaskId();
  }

  set taskId(value: number | null) {
    this.selectedTaskId.set(value);
  }

  public ngOnInit(): void {
    this.taskService.allTasks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tasks => {
      this.tasks.set(tasks);
    });
    this.listenOnTimeChange();
    this.timeService.selectedTaskId
      .pipe(
        filter((id): id is number => id !== undefined),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(id => {
        console.log('id running ', id);
        this.taskId = id;
        this.isTimerRunning.set(true);
      });
  }

  private listenOnTimeChange(): void {
    this.timeService
      .getElapsedTime$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(time => {
        this.time.set(time);
      });
  }

  public onTaskChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value.toString() !== 'Select') {
      this.taskId = Number(selectElement.value);
    } else {
      this.taskId = null;
    }
  }

  public startTimer(): void {
    if (this.taskId !== null) {
      this.isTimerRunning.set(true);
      this.timeService.startTimer(this.selectedTaskId()!);
      this.listenOnTimeChange();
    }
  }

  public stopTimer(): void {
    if (this.taskId === null) {
      return;
    }
    this.isTimerRunning.set(false);
    const elapsedTime = this.time() ?? 0;
    const task = this.tasks().find(p => p.id === this.taskId);

    if (task && elapsedTime) {
      const updatedTask: TaskResponse = {
        ...task,
        startDateTime: task.startDateTime !== undefined ? task.startDateTime : new Date(),
        endDateTime: new Date(),
        duration: Math.round(task.duration + elapsedTime),
      };

      this.timeService.stopTimer();
      this.taskService.updateTask(updatedTask, this.taskId);
    }
    this.time.set(0);
  }
}
