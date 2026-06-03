import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private activeRequests = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private shownAt: number | null = null;
  private readonly showDelayMs = 300;
  private readonly minVisibleMs = 250;

  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  start(): void {
    this.activeRequests += 1;
    if (this.activeRequests === 1) {
      this.clearTimer();
      this.clearHideTimer();
      this.showTimer = setTimeout(() => {
        this.shownAt = Date.now();
        this.loadingSubject.next(true);
      }, this.showDelayMs);
    }
  }

  stop(): void {
    if (this.activeRequests === 0) {
      return;
    }

    this.activeRequests -= 1;
    if (this.activeRequests === 0) {
      this.clearTimer();
      const elapsed = this.shownAt ? Date.now() - this.shownAt : 0;
      if (this.loadingSubject.value && elapsed < this.minVisibleMs) {
        this.clearHideTimer();
        this.hideTimer = setTimeout(() => {
          this.shownAt = null;
          this.loadingSubject.next(false);
        }, this.minVisibleMs - elapsed);
      } else {
        this.shownAt = null;
        this.loadingSubject.next(false);
      }
    }
  }

  private clearTimer(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
