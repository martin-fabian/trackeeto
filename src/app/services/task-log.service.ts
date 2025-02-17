import { Injectable } from '@angular/core';
import { TaskResponse } from '../interfaces/task-response.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskLogService {
  public saveLog(task: TaskResponse): void {
    const storedTasks: string | null = localStorage.getItem('task-log');
    const tasks: TaskResponse[] = storedTasks !== null ? JSON.parse(storedTasks) : [];
    const mergedTasks = [...tasks, task];
    this.saveToLocalStorage(mergedTasks);
  }

  private saveToLocalStorage(tasks: TaskResponse[]): void {
    localStorage.setItem('task-log', JSON.stringify(tasks));
  }

  public getLogs(taskId: number): TaskResponse[] {
    const storedTasks: string | null = localStorage.getItem('task-log');
    const tasks: TaskResponse[] = storedTasks !== null ? JSON.parse(storedTasks) : [];
    const filteredTasks = tasks.filter(task => task.id === taskId);
    return filteredTasks;
  }
}
