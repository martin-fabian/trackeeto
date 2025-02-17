import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskResponse } from '../interfaces/task-response.interface';
import { TaskRequest } from '../interfaces/task-request.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<TaskResponse[]>([]);
  private allTasksSubject = new BehaviorSubject<TaskResponse[]>([]);
  public readonly tasks$ = this.tasksSubject.asObservable();
  public readonly allTasks$ = this.allTasksSubject.asObservable();

  constructor() {
    this.loadAllTasks();
  }

  public loadTasks(projectId: number): void {
    const storedTasks: string | null = localStorage.getItem('tasks');
    if (storedTasks === null) {
      return;
    }
    const parsedStoredTasks: TaskResponse[] = JSON.parse(storedTasks);
    if (Array.isArray(parsedStoredTasks)) {
      const filteredTasks: TaskResponse[] = parsedStoredTasks.filter(task => task.projectId === projectId);
      this.tasksSubject.next(filteredTasks);
      this.mergeWithLocalStorage(projectId, filteredTasks);
    }
  }

  public loadAllTasks(): void {
    const storedTasks: string | null = localStorage.getItem('tasks');
    if (storedTasks === null) {
      return;
    }
    const parsedStoredTasks: TaskResponse[] = JSON.parse(storedTasks);
    this.allTasksSubject.next(parsedStoredTasks);
  }

  private mergeWithLocalStorage(projectId: number, tasks: TaskResponse[]): void {
    const storedTasks: string | null = localStorage.getItem('tasks');
    if (storedTasks === null) {
      this.saveToLocalStorage(tasks);
      this.tasksSubject.next(tasks);
      return;
    }

    const parsedStoredTasks: TaskResponse[] = JSON.parse(storedTasks);

    const uniqueTasks = [...parsedStoredTasks, ...tasks].reduce((map, task) => {
      map.set(task.id, task);
      return map;
    }, new Map<number, TaskResponse>());

    const filteredTasks = Array.from(uniqueTasks.values());

    this.saveToLocalStorage(filteredTasks);
    const updatedTasks: TaskResponse[] = filteredTasks.filter(task => task.projectId === projectId);
    this.tasksSubject.next(updatedTasks);
  }

  public addNewTask(projectId: number, name: string): void {
    const storedTasks: string | null = localStorage.getItem('tasks');

    const parsedStoredTasks: TaskResponse[] = storedTasks !== null ? JSON.parse(storedTasks) : [];

    let lastId =
      parsedStoredTasks !== null && parsedStoredTasks.length > 0
        ? parsedStoredTasks[parsedStoredTasks.length - 1].id
        : 0;

    const newTask: TaskRequest = {
      id: lastId + 1,
      projectId: projectId,
      name: name,
      duration: 0,
      startDateTime: undefined,
      endDateTime: undefined,
    };

    const taskResponseFromRequest: TaskResponse = {
      id: newTask.id!,
      projectId: newTask.projectId,
      name: newTask.name,
      duration: newTask.duration,
      startDateTime: newTask.startDateTime,
      endDateTime: newTask.endDateTime,
    };

    const connectedTasks = [...parsedStoredTasks, taskResponseFromRequest];
    this.mergeWithLocalStorage(projectId, connectedTasks);
  }

  public removeTask(id: number, projectId: number): void {
    const storedTasks: string | null = localStorage.getItem('tasks');
    const parsedStoredTasks: TaskResponse[] = storedTasks !== null ? JSON.parse(storedTasks) : [];
    const updatedTasks = parsedStoredTasks.filter(task => task.id !== id);
    this.saveToLocalStorage(updatedTasks);
    const returnedTasks = updatedTasks.filter(task => task.projectId === projectId);
    this.tasksSubject.next(returnedTasks);
  }

  public updateTask(updatedTask: TaskResponse, projectId: number): void {
    const storedTasks: string | null = localStorage.getItem('tasks');
    const tasks: TaskResponse[] = storedTasks !== null ? JSON.parse(storedTasks) : [];
    const updatedTasks = tasks.map(t => (t.id === updatedTask.id ? updatedTask : t));
    this.saveToLocalStorage(updatedTasks);
    const tasksToReturn = updatedTasks.filter(task => task.projectId === projectId);
    this.tasksSubject.next(tasksToReturn);
  }

  private saveToLocalStorage(tasks: TaskResponse[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}
