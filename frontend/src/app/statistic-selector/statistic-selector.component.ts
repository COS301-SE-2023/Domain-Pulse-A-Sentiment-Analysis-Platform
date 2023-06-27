import { Component } from '@angular/core';
import { AppState, SentimentScores } from '../app.state';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';

interface aggregated_metrics {
  general: {
    category: string;
    score: number;
  };
  emotions: {
    anger: number;
    disgust: number;
    fear: number;
    joy: number;
    neutral: number;
    sadness: number;
    surprise: number;
  };
  toxicity: {
    level_of_toxic: string;
    score: number;
  };
  ratios: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface DisplayableMetrics {
  overallScore: number;
  positiveScore: number;
  negativeScore: number;
  neutralScore: number;
  emotion: string;
  emotionIconUrl: string;
  toxicity: number;
  analysedSum: string;
}

@Component({
  selector: 'statistic-selector',
  templateUrl: './statistic-selector.component.html',
  styleUrls: ['./statistic-selector.component.sass'],
})
export class StatisticSelectorComponent {
  @Select(AppState.sourceOverallSentimentScores)
  sourceOverallSentiment!: Observable<any | null>;

  displayedMetrics?: DisplayableMetrics;

  mockData?: { aggregated_metrics: aggregated_metrics; metadata?: any };

  overrallScore = 70;

  constructor(private store: Store) {
    this.sourceOverallSentiment.subscribe((newAnalysisData) => {
      this.mockData = newAnalysisData;
      this.displayedMetrics = this.assignValues(newAnalysisData);
    });
  }

  assignValues(
    freshData: aggregated_metrics,
    metaData?: any
  ): DisplayableMetrics {
    const aggregatedMetrics = freshData;

    const overallScore = Math.floor(aggregatedMetrics.general.score * 100);
    const positiveScore = Math.floor(aggregatedMetrics.ratios.positive * 100);
    const negativeScore = Math.floor(aggregatedMetrics.ratios.negative * 100);
    const neutralScore = Math.floor(aggregatedMetrics.ratios.neutral * 100);

    const emotions: { [key: string]: number } = aggregatedMetrics.emotions;
    let emotion = Object.keys(emotions).reduce((a, b) =>
      emotions[a] > emotions[b] ? a : b
    );

    const emotionIconUrl = `../../assets/logos/${emotion.toLowerCase()}.png`;

    const toxicity = Math.floor(aggregatedMetrics.toxicity.score * 100);

    return {
      overallScore,
      positiveScore,
      negativeScore,
      neutralScore,
      emotion,
      emotionIconUrl,
      toxicity,
      analysedSum: '23k',
    };
  }
}
