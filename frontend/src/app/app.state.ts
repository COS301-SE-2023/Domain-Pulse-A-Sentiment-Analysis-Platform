import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';

export interface DisplayDomain {
  id: number;
  name: string;
  selected: boolean;
}

export interface DisplaySource {
  id: number;
  name: string;
  url: string;
  selected: boolean;
}

export interface SentimentScores {
  overallScore: number;
  positiveScore: number;
  negativeScore: number;
  neutralScore: number;
  objectivityScore: number;
  subjectivityScore: number;
  analysedSum: number;
}

export class Comment {
  comment: string;
  commentSentiment: SentimentScores;
  colorClass: string;

  constructor(comment: string, commentSentiment: SentimentScores) {
    this.comment = comment;
    this.commentSentiment = commentSentiment;

    if (commentSentiment.overallScore >= 70) {
      this.colorClass = 'positive-color';
    } else if (
      commentSentiment.overallScore >= 40 &&
      commentSentiment.overallScore < 70
    ) {
      this.colorClass = 'neutral-color';
    } else {
      this.colorClass = 'negative-color';
    }
  }
}

interface AppStateModel {
  profileId: number;
  domains?: DisplayDomain[];
  sources?: DisplaySource[];
  sentimentScores?: SentimentScores;
  comments?: Comment[];
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    profileId: 1,
  },
})
@Injectable()
export class AppState {}
