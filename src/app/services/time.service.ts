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
      localStorage.setItem(`startTime-${id}`, this.startTime()!.toString());
    }

    const subscription = interval(1000)
      .pipe(map(() => Date.now() - this.startTime()))
      .subscribe(timeElapsed => {
        console.log(`Projekt ${id}: ${timeElapsed} ms`);
        this.elapsedTimeSubject.next(timeElapsed);
      });

    this.timerSubscription = subscription;
  }

  stopTimer(id: number) {
    if (this.startTime()) {
      const totalTime = Date.now() - this.startTime();
      console.log(`Projekt ${id} dokončen: ${totalTime} ms`);
      this.resetTimer(id);
    }
  }

  private resetTimer(id: number) {
    this.selectedProjectId.next(undefined);
    this.startTime.set(0);
    localStorage.removeItem(`startTime-${id}`);
    this.timerSubscription.unsubscribe();
    this.elapsedTimeSubject.next(0);
  }
}
