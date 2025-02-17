import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskLogService } from '../services/task-log.service';
import { TaskResponse } from '../interfaces/task-response.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-log',
  imports: [DatePipe],
  templateUrl: './task-log.component.html',
  styleUrl: './task-log.component.scss',
  standalone: true,
})
export class TaskLogComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  public taskLogs = signal<TaskResponse[]>([]);
  private readonly taskLogService = inject(TaskLogService);

  public ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId === undefined || isNaN(Number(taskId))) {
      return;
    }

    this.taskLogs.set(this.taskLogService.getLogs(Number(taskId)));
  }
}
