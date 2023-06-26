import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { AppApi } from './app.api';
import {
  AddNewDomain,
  AddNewSource,
  AttempPsswdLogin,
  CheckAuthenticate,
  GetDomains,
  GetOverallSentimentScores,
  GetSources,
  RegisterUser,
  SetDomain,
  SetProfileId,
  SetSource,
} from './app.actions';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
export interface Source {
  source_id: number;
  source_name: string;
  sourceImageUrl: string;
}
export interface DisplayDomain {
  id: number;
  name: string;
  description: string;
  selected: boolean;
  imageUrl: string;
  sourceIds: number[];
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
  authenticated: boolean;
  domains?: DisplayDomain[];
  selectedDomain?: DisplayDomain;
  sources?: DisplaySource[];
  selectedSource?: DisplaySource;
  overallSentimentScores?: SentimentScores;
  comments?: Comment[];
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    profileId: 1,
    authenticated: false,
  },
})
@Injectable()
export class AppState {
  constructor(
    private readonly appApi: AppApi,
    private readonly store: Store,
    private readonly router: Router
  ) {
    // setTimeout(() => {
    //   this.store.dispatch(new CheckAuthenticate()).subscribe(() => {
    //     if (this.store.selectSnapshot((state) => state.app.authenticated)) {
    //       this.store.dispatch(new GetDomains());
    //     } else {
    //       this.router.navigate(['/register']);
    //     }
    //   });
    // }, 300);
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
  static selectedSource(state: AppStateModel) {
    if (state.selectedSource) return state.selectedSource;
    return undefined;
  }

  @Selector()
  static overallSentimentScores(state: AppStateModel) {
    if (state.overallSentimentScores) return state.overallSentimentScores;
    return undefined;
  }

  @Action(GetDomains)
  getDomains(ctx: StateContext<AppStateModel>) {
    this.appApi.getDomainIDs(ctx.getState().profileId).subscribe((res: any) => {
      if (res.status === 'FAILURE') {
        // CHRIS ERROR HANDLE
        alert('CHRIS ERROR HANDLE');
        return;
      }

      let domainIDs: number[] = res.domainIDs;

      let firstDomain = true;

      domainIDs.map((domainID: number) => {
        this.appApi.getDomainInfo(domainID).subscribe((domainRes: any) => {
          if (domainRes.status === 'FAILURE') {
            // CHRIS ERROR HANDLE
            alert('CHRIS ERROR HANDLE');
            return;
          }

          let domain: DisplayDomain = {
            id: domainRes.id,
            name: domainRes.name,
            description: domainRes.description,
            imageUrl: '../assets/' + domainRes.icon,
            sourceIds: domainRes.sources,
            selected: false,
          };

          let domains = ctx.getState().domains;
          if (domains) {
            ctx.patchState({
              domains: [...domains, domain],
            });
          } else {
            ctx.patchState({
              domains: [domain],
            });
          }

          if (firstDomain) {
            // domain.selected = true;
            firstDomain = false;
            this.store.dispatch(new SetDomain(domain));

            // this will use the selected domain
            this.store.dispatch(new GetSources());
          }

          console.log(ctx.getState().domains);
        });
      });
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

    this.store.dispatch(new GetSources());
  }

  @Action(GetSources)
  getSources(ctx: StateContext<AppStateModel>) {
    let selectedDomain = ctx.getState().selectedDomain;
    if (!selectedDomain) return;

    let firstSource = true;

    // initialize sources to empty array
    ctx.patchState({
      sources: [],
    });

    for (let sourceID of selectedDomain.sourceIds) {
      let sources = ctx.getState().sources;
      let mockSource = this.idToSource(sourceID);

      if (firstSource) {
        console.log('first source');
        this.store.dispatch(new SetSource(mockSource));
        firstSource = false;
      }

      if (sources) {
        ctx.patchState({
          sources: [...sources, mockSource],
        });
      }

      // this.appApi.getSourceInfo(sourceID).subscribe((sourceRes: any) => {
      //   if (sourceRes.status === 'FAILURE') {
      //     // CHRIS ERROR HANDLE
      //     alert('CHRIS ERROR HANDLE');
      //     return;
      //   }

      //   let source: DisplaySource = {
      //     id: sourceRes.id,
      //     name: sourceRes.name,
      //     url: sourceRes.url,
      //     selected: false,
      //   };

      //   let sources = ctx.getState().sources;
      //   if (sources) {
      //     ctx.patchState({
      //       sources: [...sources, source],
      //     });
      //   } else {
      //     ctx.patchState({
      //       sources: [source],
      //     });
      //   }
      // });
    }
  }

  @Action(SetSource)
  setSource(ctx: StateContext<AppStateModel>, state: SetSource) {
    let sources = ctx.getState().sources;
    if (!sources) return;

    for (let souce of sources) {
      souce.selected = false;
    }
    state.source.selected = true;

    ctx.patchState({
      sources: sources,
      selectedSource: state.source,
    });

    this.store.dispatch(new GetOverallSentimentScores());
  }

  @Action(AddNewSource)
  addNewSource(ctx: StateContext<AppStateModel>, state: AddNewSource) {
    let source_image_name = '';
    switch (state.platform) {
      case 'facebook':
        source_image_name = 'facebook-logo.png';
        break;
      case 'instagram':
        source_image_name = 'instagram-Icon.png';
        break;
      case 'reddit':
        source_image_name = 'reddit-logo.png';
        break;
    }

    let selectedDomain = ctx.getState().selectedDomain;
    if (!selectedDomain) return;

    let domainID = selectedDomain.id;
    this.appApi
      .addSource(domainID, state.name, source_image_name)
      .subscribe((res) => {
        // Not sure as to whether i should just reget all the data or just use the response
        this.store.dispatch(new GetDomains());
      });
  }

  @Action(AddNewDomain)
  addNewDomain(ctx: StateContext<AppStateModel>, state: AddNewDomain) {
    console.log(state);

    this.appApi
      .addDomain(state.domainName, state.description, state.domainImagUrl)
      .subscribe((res) => {
        if (res.status === 'FAILURE') {
          // CHRIS ERROR HANDLE
          alert('CHRIS ERROR HANDLE');
          return;
        }

        let userID = ctx.getState().profileId;
        this.appApi.linkDomainToProfile(res.id, userID).subscribe((res2) => {
          console.log(res2);

          if (res2.status === 'FAILURE') {
            // CHRIS ERROR HANDLE
            alert('CHRIS ERROR HANDLE');
            return;
          }

          this.store.dispatch(new GetDomains());
        });
      });
  }

  @Action(GetOverallSentimentScores)
  getOverallSentimentScores(ctx: StateContext<AppStateModel>) {
    // TODO have a selected Source
    let selectedSource = ctx.getState().selectedSource;
    if (!selectedSource) return;
    let selectedSourceID = selectedSource.id;

    this.appApi.getOverallSentimentScores(selectedSourceID).subscribe((res) => {
      console.log(res);
    });
  }

  @Action(CheckAuthenticate)
  checkAuthenticate(ctx: StateContext<AppStateModel>) {
    this.appApi.checkAuthenticate().subscribe((res: any) => {
      if (res.status == 'SUCCESS') return true;
      else return false;
    });
  }
  @Action(AttempPsswdLogin)
  attempPsswdLogin(ctx: StateContext<AppStateModel>, state: AttempPsswdLogin) {
    this.appApi
      .attemptPsswdLogin(state.username, state.password)
      .subscribe((res) => {
        if (res.status == 'SUCCESS') {
          this.store.dispatch(new SetProfileId(res.id));
          this.store.dispatch(new GetDomains());
          this.router.navigate(['']);
        } else {
          // CHRIS ERROR HANDLE
          alert('ERROR FOR CHRIS');
        }
      });
  }

  @Action(RegisterUser)
  registerUser(ctx: StateContext<AppStateModel>, state: RegisterUser) {
    this.appApi
      .registerUser(state.username, state.password, state.email)
      .subscribe((res) => {
        if (res.status == 'SUCCESS') {
          this.router.navigate(['']);
        } else {
          // CHRIS ERROR HANDLE
          alert('ERROR FOR CHRIS');
        }
      });
  }

  // fake soruce to info
  private idToSource(id: number): DisplaySource {
    let displaySource: DisplaySource;
    switch (id) {
      case 0:
        displaySource = {
          id: id,
          name: 'Goddess Cafe Waterkloof',
          url: 'google-reviews.png',
          selected: false,
        };
        break;
      case 1:
        displaySource = {
          id: id,
          name: 'Goddess Cafe Rietondale',
          url: 'google-reviews.png',
          selected: false,
        };
        break;
      case 2:
        displaySource = {
          id: id,
          name: "Heineken Champion's Cup",
          url: 'instagram-Icon.png',
          selected: false,
        };
        break;
      case 3:
        displaySource = {
          id: id,
          name: 'Cell C Sharks',
          url: 'instagram-Icon.png',
          selected: false,
        };
        break;
      case 4:
        displaySource = {
          id: id,
          name: 'Tuks',
          url: 'google-reviews.png',
          selected: false,
        };
        break;
      default:
        displaySource = {
          id: id,
          name: 'Goddess Cafe Waterkloof',
          url: 'google-reviews.png',
          selected: false,
        };
    }
    return displaySource;
  }
}
