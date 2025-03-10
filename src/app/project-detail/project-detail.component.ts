import { inject, DestroyRef, Component, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimeService } from '../services/time.service';
import { DatePipe } from '@angular/common';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TaskResponse } from '../interfaces/task-response.interface';
import { TaskService } from '../services/task.service';
import { TaskLogService } from '../services/task-log.service';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';

@Component({
  selector: 'app-project-deail',
  imports: [DatePipe, TaskFormComponent, RouterLink, FormsModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
  standalone: true,
})
export class ProjectDetailComponent implements OnInit {
  public readonly tasks = signal<TaskResponse[]>([]);
  private readonly timeService = inject(TimeService);
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly isTimerRunningMap = signal(new Map<number, boolean>());
  public readonly time = signal<number | undefined>(undefined);
  protected readonly selectedTaskId = signal<number | null>(null);
  public readonly isAnyTaskRunning = signal(false);
  public readonly showModal = signal(false);
  private readonly route = inject(ActivatedRoute);
  public readonly projectId = signal<number | undefined>(undefined);
  private readonly taskLogService = inject(TaskLogService);
  public isNameInvalid = signal(false);
  public readonly maxNameLength = 10;

  get taskId(): number | null {
    return this.selectedTaskId();
  }

  set taskId(value: number | null) {
    this.selectedTaskId.set(value);
  }

  public ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId === undefined || isNaN(Number(projectId))) {
      return;
    }
    this.projectId.set(Number(projectId));
    this.taskService.loadTasks(this.projectId()!);
    this.taskService.tasks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tasks => this.tasks.set(tasks));
    this.listenOnIdChange();
    this.listenOnTimeChange();
  }

  public hideModal(): void {
    this.showModal.set(false);
  }

  public openModal(): void {
    this.showModal.set(true);
  }

  private listenOnIdChange(): void {
    this.timeService.selectedTaskId
      .pipe(
        filter((id): id is number => id !== undefined),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(id => {
        if (id) {
          const runningTask = this.tasks().find(task => task.id === id);
          this.isTimerRunningMap.set(new Map().set(runningTask!.id, true));
        }
      });
  }

  private listenOnTimeChange(): void {
    this.timeService
      .getElapsedTime$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(time => this.time.set(time));
  }

  public removeTask(event: Event, id: number): void {
    event.stopPropagation();
    this.taskService.removeTask(id, this.projectId()!);
  }

  public startTimer(id: number, event: Event): void {
    event.stopPropagation();
    let runningTaskId: number | null = null;
    for (const [taskId, isRunning] of this.isTimerRunningMap().entries()) {
      if (isRunning) {
        runningTaskId = taskId;
        break;
      }
    }

    if (runningTaskId !== null) {
      this.stopTimer(runningTaskId);
    }

    const mapCopy = new Map(this.isTimerRunningMap());
    mapCopy.set(id, true);
    this.isTimerRunningMap.set(mapCopy);
    this.timeService.startTimer(id);
  }

  public stopTimer(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const mapCopy = new Map(this.isTimerRunningMap());
    mapCopy.set(id, false);
    this.isTimerRunningMap.set(mapCopy);

    const task = this.tasks().find(p => p.id === id);
    if (!task || this.time() === undefined) {
      return;
    }
    const updatedTask: TaskResponse = {
      ...task,
      startDateTime: task.startDateTime !== undefined ? task.startDateTime : new Date(),
      endDateTime: new Date(),
      duration: Math.round(task.duration + this.time()!),
    };
    const logTask = {
      ...updatedTask,
      duration: Math.round(this.time()!),
    };

    this.timeService.stopTimer();
    this.taskService.updateTask(updatedTask, this.projectId()!);
    this.taskLogService.saveLog(logTask);
    this.time.set(0);
    this.isAnyTaskRunning.set(false);
  }

  public onKeyPress(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    const regex = /^[0-9]+$/;

    if (!regex.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  public stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  // TODO we can call one method with one more identificator if it is name or time
  public onBlureName(event: FocusEvent, taskId: number): void {
    const input = event.target as HTMLInputElement;

    if (input.value.length > this.maxNameLength) {
      return;
    }

    const task = this.tasks().find(p => p.id === taskId);
    if (!task) {
      return;
    }
    task.name = input.value;
    this.taskService.updateTask(task, this.projectId()!);
  }

  public onBlur(event: FocusEvent, taskId: number): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '');

    const match = value.match(/^(\d{0,2}):?(\d{0,2})?:?(\d{0,2})?$/);

    if (match && value !== '00:00:00') {
      const hours = parseInt(match[1] || '0', 10);
      const minutes = parseInt(match[2] || '0', 10);
      const seconds = parseInt(match[3] || '0', 10);

      // TODO check if input values are within correct time values <= 60
      input.value = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      const newDuration = (hours * 3600 + minutes * 60 + seconds) * 1000;

      const task = this.tasks().find(p => p.id === taskId);

      if (task && task.endDateTime) {
        const oldDuration = task.duration;
        const diff = newDuration - oldDuration;

        task.endDateTime = new Date(new Date(task.endDateTime).getTime() + diff);
        task.startDateTime = new Date(new Date(task.endDateTime).getTime() - newDuration);

        const now = new Date();
        if (task.endDateTime > now) {
          task.endDateTime = now;
          task.startDateTime = new Date(now.getTime() - newDuration);
        }
      } else {
        const now = new Date();
        task!.endDateTime = now;
        task!.startDateTime = new Date(now.getTime() - newDuration);
      }

      const updatedTask: TaskResponse = {
        ...task!,
        duration: newDuration,
      };

      this.taskService.updateTask(updatedTask, this.projectId()!);
    } else {
      input.value = '00:00:00';
    }

    this.time.set(Number(input.value));
  }
}
