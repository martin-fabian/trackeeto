import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeService } from '../services/time.service';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-main-menu',
  imports: [RouterLink, AsyncPipe, DatePipe],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss',
  standalone: true
})
export class MainMenuComponent {
  private readonly timeService = inject(TimeService);
  public readonly time$ = this.timeService.getElapsedTime$(1);
}
