import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppState } from '../app.state';
import { Select } from '@ngxs/store';

@Component({
  selector: 'comments-view',
  templateUrl: './comments-view.component.html',
  styleUrls: ['./comments-view.component.sass'],
})
export class CommentsViewComponent {
  @Select(AppState.sampleData) sampleData!: Observable<any | null>;

  comments?: any[];

  constructor() {
    this.sampleData.subscribe((newSampleData) => {
      if (newSampleData) {
        this.comments = this.transformComments(newSampleData);
      }
    });
  }

  transformComments(jsonData: any): any[] {
    const individualMetrics = jsonData;

    return individualMetrics.map((metric: any) => ({
      comment: metric.data,
      ratings: [
        `${Math.floor(metric.general.score * 100)}%`,
        metric.general.category.toLowerCase().replace(/_/g, ' '),
        Object.keys(metric.emotions).reduce((a, b) =>
          metric.emotions[a] > metric.emotions[b] ? a : b
        ),
      ],
    }));
  }

  getRatingColor(score: string): string {
    let colorClass = '';
    if (score.includes('%')) {
      const percentage = parseInt(score, 10);
      if (percentage >= 70) {
        colorClass = 'positive-color';
      } else if (percentage >= 40 && percentage < 70) {
        colorClass = 'neutral-color';
      } else {
        colorClass = 'negative-color';
      }
    } else {
      colorClass = 'neutral-color';
    }
    return colorClass;
  }
}
