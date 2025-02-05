import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, interval, map, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  private startTime = signal(0);
  private timerSubscription = new Subscription();
  private elapsedTimeSubject = new BehaviorSubject<number>(0);
  public selectedProjectId = new BehaviorSubject<number | undefined>(undefined);

  public getElapsedTime$(): Observable<number> {
    return this.elapsedTimeSubject.asObservable();
  }

  startTimer(id: number) {
    if (this.selectedProjectId.getValue()) {
      return;
    }

    this.selectedProjectId.next(id);
    if (!this.startTime()) {
      this.startTime.set(Date.now());
    }

    const subscription = interval(1000)
      .pipe(map(() => Date.now() - this.startTime()))
      .subscribe(timeElapsed => {
        this.elapsedTimeSubject.next(timeElapsed);
      });

    this.timerSubscription = subscription;
  }

  stopTimer(id: number) {
    if (this.startTime()) {
      this.resetTimer(id);
    }
  }

  private resetTimer(id: number) {
    this.selectedProjectId.next(undefined);
    this.startTime.set(0);
    this.timerSubscription.unsubscribe();
    this.elapsedTimeSubject.next(0);
  }
}
