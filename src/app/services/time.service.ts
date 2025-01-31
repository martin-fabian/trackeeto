import { Injectable } from '@angular/core'
import { BehaviorSubject, interval, map, Observable, Subscription } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  private startTimes = new Map<number, number>()
  private timerSubscriptions = new Map<number, Subscription>()
  private elapsedTimeSubjects = new Map<number, BehaviorSubject<number>>()
  public selectedProjectId = new BehaviorSubject<number | undefined>(undefined)

  public getElapsedTime$(id: number): Observable<number> {
    if (!this.elapsedTimeSubjects.has(id)) {
      this.elapsedTimeSubjects.set(id, new BehaviorSubject<number>(0))
    }
    return this.elapsedTimeSubjects.get(id)!.asObservable()
  }

  startTimer(id: number) {
    this.selectedProjectId.next(id)
    if (!this.startTimes.has(id)) {
      this.startTimes.set(id, Date.now())
      localStorage.setItem(`startTime-${id}`, this.startTimes.get(id)!.toString())
    }

    if (this.timerSubscriptions.has(id)) {
      return
    }

    const elapsedTimeSubject = this.getElapsedTimeSubject(id)

    const subscription = interval(1000)
      .pipe(map(() => Date.now() - (this.startTimes.get(id) as number)))
      .subscribe((timeElapsed) => {
        console.log(`Projekt ${id}: ${timeElapsed} ms`)
        elapsedTimeSubject.next(timeElapsed)
      })

    this.timerSubscriptions.set(id, subscription)
  }

  stopTimer(id: number) {
    if (this.startTimes.has(id)) {
      const totalTime = Date.now() - (this.startTimes.get(id) as number)
      console.log(`Projekt ${id} dokončen: ${totalTime} ms`)
      this.resetTimer(id)
    }
  }

  private resetTimer(id: number) {
    this.selectedProjectId.next(undefined)
    this.startTimes.delete(id)
    localStorage.removeItem(`startTime-${id}`)
    this.timerSubscriptions.get(id)?.unsubscribe()
    this.timerSubscriptions.delete(id)
    this.getElapsedTimeSubject(id).next(0)
  }

  private getElapsedTimeSubject(id: number): BehaviorSubject<number> {
    if (!this.elapsedTimeSubjects.has(id)) {
      this.elapsedTimeSubjects.set(id, new BehaviorSubject<number>(0))
    }
    return this.elapsedTimeSubjects.get(id)!
  }
}
