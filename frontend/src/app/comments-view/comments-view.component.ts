import { Component } from '@angular/core';

@Component({
  selector: 'comments-view',
  templateUrl: './comments-view.component.html',
  styleUrls: ['./comments-view.component.sass']
})
export class CommentsViewComponent {
    comments: any[];

    constructor() {
      this.comments = [
        {
          comment: "I love the cozy atmosphere and friendly staff at my local Starbucks. It's my go-to place for a delicious cup of coffee and a relaxing time.",
          ratings: ["20%", "Somewhat Negative"]
        },
        {
          comment: "The quality of the drinks at Starbucks never disappoints. I always look forward to trying their seasonal offerings. The Pumpkin Spice Latte is my absolute favorite!",
          ratings: ["70%", "Very Positive"]
        },
        {
          comment: "I visit Starbucks frequently for their variety of refreshing iced beverages. Their iced caramel macchiato is simply divine!",
          ratings: ["56%", "Neutral"]
        },
        {
          comment: "Unfortunately, the Starbucks near my office often has long queues, especially during peak hours. It can be frustrating when I'm in a hurry and need my coffee fix.",
          ratings: ["15%", "Somewhat Negative"]
        }
      ];
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



