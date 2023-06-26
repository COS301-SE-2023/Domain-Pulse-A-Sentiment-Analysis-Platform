import { Component } from '@angular/core';
import { AppState, SentimentScores } from '../app.state';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { GetOverallSentimentScores } from '../app.actions';

@Component({
  selector: 'statistic-selector',
  templateUrl: './statistic-selector.component.html',
  styleUrls: ['./statistic-selector.component.sass'],
})
export class StatisticSelectorComponent {
  @Select(AppState.overallSentimentScores)
  sentimentScores$!: Observable<SentimentScores | null>;

  overrallScore = 70;

  positiveScore = 70;
  negativeScore = 22;
  neutralScore = 8;

  emotion = 'Joy';
  emotionIconUrl = '../../assets/logos/' + this.emotion.toLowerCase() + '.png';

  toxicity = 10;

  analysedSum = '23k';

  constructor(private store: Store) {
    // this.store.dispatch(new GetOverallSentimentScores());
    // this.sentimentScores$.subscribe((scores) => {
    //   console.log(scores);
    // });
  }
}
