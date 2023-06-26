import { Component } from '@angular/core';

@Component({
  selector: 'comments-view',
  templateUrl: './comments-view.component.html',
  styleUrls: ['./comments-view.component.sass']
})
export class CommentsViewComponent {

  mockData =
    {
      "individual_metrics": [
        {
          "_id": "",
          "data": "When a Coffee shop serves gluten-free cake they get a 110% review from me. The gluten-free orange almond cake is delicious. Thank you, Goddess Café. This is a really feel-good place for anyone. I visited them a few times now. The service is exceptional and I feel like a goddess when eating there. The Brooklyn Goddess Café is just as good. Difficult to choose, but Soutpansberg is more spacious",
          "general": {
            "category": "VERY_POSITIVE",
            "score": 0.9998
          },
          "emotions": {
            "neutral": 0.0059,
            "surprise": 0.0041,
            "joy": 0.99
          },
          "toxicity": {
            "level_of_toxic": "Non-toxic",
            "score": 0.0005
          },
          "ratios": {
            "positive": 0.19,
            "neutral": 0.77,
            "negative": 0.04
          },
          "source_id": 1
        },
        {
          "_id": "",
          "data": "Lovely place, fantastic atmosphere, very delicious food and Rosy helped us, very friendly and beautiful woman who cares for her Clients",
          "general": {
            "category": "VERY_POSITIVE",
            "score": 0.9999
          },
          "emotions": {
            "surprise": 0.0039,
            "neutral": 0.0037,
            "joy": 0.9924
          },
          "toxicity": {
            "level_of_toxic": "Non-toxic",
            "score": 0.0007
          },
          "ratios": {
            "positive": 0.66,
            "neutral": 0.34,
            "negative": 0
          },
          "source_id": 1
        },
        {
          "_id": "",
          "data": "Extremely overated, coffee was mediocre and the pink white chocolate was seriously bad, could not finish the drink. The service was so bad we didn't even order food. Why bother.",
          "general": {
            "category": "VERY_NEGATIVE",
            "score": 0.0001
          },
          "emotions": {
            "anger": 0.1618,
            "sadness": 0.7863,
            "surprise": 0.0519
          },
          "toxicity": {
            "level_of_toxic": "Non-toxic",
            "score": 0.0022
          },
          "ratios": {
            "positive": 0,
            "neutral": 0.665,
            "negative": 0.335
          },
          "source_id": 1
        }
      ]
    }

    transformComments(jsonData: any): any[] {
      const individualMetrics = jsonData.individual_metrics;
    
      return individualMetrics.map((metric: any) => ({
        comment: metric.data,
        ratings: [
          `${Math.floor(metric.ratios.positive * 100)}%`,
            metric.general.category.toLowerCase().replace(/_/g, ' '),
            Object.keys(metric.emotions).reduce((a, b) =>
            metric.emotions[a] > metric.emotions[b] ? a : b
          )
        ]
      }));
    }

  comments: any[] = this.transformComments(this.mockData);

  constructor() {
   
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



