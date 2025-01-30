import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, interval, map, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private startTime: number | null = null;
  private timerSubscription: Subscription | null = null;

  private elapsedTimeSubject = new BehaviorSubject<number>(0);
  elapsedTime$ = this.elapsedTimeSubject.asObservable();

  constructor() {
    this.restoreTimer();
  }

  startTimer() {
    if (!this.startTime) {
      this.startTime = Date.now();
      localStorage.setItem('startTime', this.startTime.toString());
    }

    this.timerSubscription = interval(1000)
      .pipe(map(() => Date.now() - (this.startTime as number)))
      .subscribe(timeElapsed => {
        console.log(timeElapsed)
        this.elapsedTimeSubject.next(timeElapsed);
      });
  }

  stopTimer() {
    if (this.startTime) {
      const totalTime = Date.now() - this.startTime;
      console.log(`Celkový čas: ${totalTime} ms`);
      this.resetTimer();
    }
  }

  private resetTimer() {
    this.startTime = null;
    localStorage.removeItem('startTime');
    this.elapsedTimeSubject.next(0);
    this.timerSubscription?.unsubscribe();
  }

  private restoreTimer() {
    const savedStartTime = localStorage.getItem('startTime');
    if (savedStartTime) {
      this.startTime = parseInt(savedStartTime, 10);
      this.startTimer();
    }
  }
}
