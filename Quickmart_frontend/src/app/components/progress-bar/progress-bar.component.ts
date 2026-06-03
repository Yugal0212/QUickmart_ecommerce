import { CommonModule, NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-progress-bar',
  imports: [NgClass,CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnInit  {
  currentStep: number = 1;
  progressWidth: string = '0%';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.updateStep();
    });
  }

  updateStep(): void {
    const path = this.router.url;
    if (path.includes('address')) {
      this.currentStep = 1;
    } else if (path.includes('order-summary')) {
      this.currentStep = 2;
    } else if (path.includes('Payment')) {
      this.currentStep = 3;
    } else if (path.includes('complete')) {
      this.currentStep = 4;
    }
    this.updateProgressBar();
  }

  updateProgressBar(): void {
    this.progressWidth = `${(this.currentStep - 1) * 33}%`;
  }
}
