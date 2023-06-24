import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { AppApi } from './app.api';
import { GetDomains, SetDomain } from './app.actions';
export interface Source {
  source_id: number;
  source_name: string;
  sourceImageUrl: string;
}
export interface DisplayDomain {
  id: number;
  name: string;
  selected: boolean;
  imageUrl: string;
  sources: Source[];
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
  selectedDomain?: DisplayDomain;
  sources?: DisplaySource[];
  overallSentimentScores?: SentimentScores;
  comments?: Comment[];
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    profileId: 1,
  },
})
@Injectable()
export class AppState {
  constructor(private readonly appApi: AppApi, private readonly store: Store) {
    setTimeout(() => {
      this.store.dispatch(new GetDomains());
    }, 300); // put this dispatch in the right place
  }

  @Selector()
  static domains(state: AppStateModel) {
    if (state.domains && state.domains.length > 0) return state.domains;
    return undefined;
  }

  @Selector()
  static selectedDomain(state: AppStateModel) {
    if (state.selectedDomain) return state.selectedDomain;
    return undefined;
  }

  @Selector()
  static sources(state: AppStateModel) {
    if (state.sources && state.sources.length > 0) return state.sources;
    return undefined;
  }

  @Selector()
  static overallSentimentScores(state: AppStateModel) {
    if (state.overallSentimentScores) return state.overallSentimentScores;
    return undefined;
  }

  @Action(GetDomains)
  getDomains(ctx: StateContext<AppStateModel>) {
    this.appApi.getDomains(ctx.getState().profileId).subscribe((res: any) => {
      let domainArr: DisplayDomain[] = res.domains.map((domain: any) => {
        // let selected = false;
        // if (firstt) {
        //   selected = true;
        //   firstt = false;
        // }
        return {
          id: domain.domain_id,
          name: domain.domain_name,
          imageUrl: '../assets/' + domain.image_url,
          sources: domain.sources.map((source: any) => {
            let newSource: Source = {
              source_id: source.source_id,
              source_name: source.source_name,
              sourceImageUrl: source.source_image_name,
            };
            return newSource;
          }),
          selected: false,
        };
      });

      ctx.patchState({
        domains: domainArr,
      });

      if (domainArr.length > 0)
        this.store.dispatch(new SetDomain(domainArr[0]));

      console.log(domainArr);
    });
  }

  @Action(SetDomain)
  setDomain(ctx: StateContext<AppStateModel>, state: SetDomain) {
    let domains = ctx.getState().domains;
    if (!domains) return;

    for (let domain of domains) {
      domain.selected = false;
    }
    state.domain.selected = true;
    ctx.patchState({
      domains: domains,
      selectedDomain: state.domain,
    });
  }
}
