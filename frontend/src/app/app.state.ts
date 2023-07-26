import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { AppApi } from './app.api';
import {
  AddNewDomain,
  AddNewSource,
  AttempPsswdLogin,
  CheckAuthenticate,
  GetDomains,
  GetSources,
  RegisterUser,
  SetDomain,
  SetSource,
  GetSourceDashBoardInfo,
  ChooseStatistic,
  EditDomain,
  DeleteDomain,
  SetProfileDetails,
  RefreshSourceData,
  Initialise,
} from './app.actions';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgZone } from '@angular/core';

export interface Source {
  source_id: string;
  source_name: string;
  sourceImageUrl: string;
}
export interface DisplayDomain {
  id: number;
  name: string;
  description: string;
  selected: boolean;
  imageUrl: string;
  sourceIds: string[];
  sources: DisplaySource[];
}

export interface DisplaySource {
  id: string;
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

export interface ProfileDetails {
  userId: number;
  username: string;
  email: string;
  profileIconUrl: string;
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
  profileDetails?: ProfileDetails;
  authenticated: boolean;
  domains?: DisplayDomain[];
  selectedDomain?: DisplayDomain;
  sources?: DisplaySource[];
  selectedSource?: DisplaySource;
  // overallSentimentScores?: SentimentScores;
  overallSentimentScores?: any;
  // sampleData?: Comment[];
  sampleData?: any[];
  selectedStatisticIndex: number;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    authenticated: false,
    selectedStatisticIndex: 0,
  },
})
@Injectable()
export class AppState {
  constructor(
    private readonly appApi: AppApi,
    private readonly store: Store,
    private readonly router: Router,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {
    // // subscipte to changes to profile details
    let detailsSet = false;
    this.store
      .select((state) => state)
      .subscribe((res) => {
        if (!detailsSet) {
          if (res.app?.profileDetails) {
            this.store.dispatch(new GetDomains());
            detailsSet = true;
          }
        }
      });
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
  static sourceOverallSentimentScores(state: AppStateModel) {
    if (state.overallSentimentScores) return state.overallSentimentScores;
    return undefined;
  }

  @Selector()
  static sampleData(state: AppStateModel) {
    if (state.sampleData) return state.sampleData;
    return undefined;
  }

  @Selector()
  static statisticIndex(state: AppStateModel) {
    return state.selectedStatisticIndex;
  }

  @Selector()
  static profileDetails(state: AppStateModel) {
    if (state.profileDetails) return state.profileDetails;
    return undefined;
  }

  @Action(Initialise)
  initiliaze(ctx: StateContext<AppStateModel>) {
    this.store.dispatch(new CheckAuthenticate());
  }

  @Action(GetDomains)
  getDomains(ctx: StateContext<AppStateModel>) {
    const profileDetails = ctx.getState().profileDetails;
    if (!profileDetails) return;

    this.appApi.getDomainIDs(profileDetails.userId).subscribe((res: any) => {
      if (res.status === 'FAILURE') {
        this.toastr.error('Your domains could not be retrieved', '', {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
          toastClass: 'custom-toast error ngx-toastr',
        });
        return;
      }

      let domainIDs: number[] = res.domainIDs;

      let firstDomain = true;

      domainIDs.map((domainID: number) => {
        this.appApi.getDomainInfo(domainID).subscribe((res: any) => {
          if (res.status === 'FAILURE') {
            this.toastr.error(
              'The info for one of your domains could not be retrieved',
              '',
              {
                timeOut: 3000,
                positionClass: 'toast-bottom-center',
                toastClass: 'custom-toast error ngx-toastr',
              }
            );
            return;
          }

          let domainRes = res.domain;
          let domainsIDs = domainRes.sources.map(
            (source: any) => source.source_id
          );
          let domain: DisplayDomain = {
            id: domainRes._id,
            name: domainRes.name,
            description: domainRes.description,
            imageUrl: '../assets/' + domainRes.icon,
            sourceIds: domainsIDs,
            sources: this.formatResponseSources(domainRes.sources),
            selected: false,
          };

          let domains = ctx.getState().domains;
          // domains.push(domain);
          // domains = domains?.filter((domain) => domain.id != domainRes._id);

          if (firstDomain) {
            firstDomain = false;
            ctx.patchState({
              domains: [domain],
            });

            this.store.dispatch(new SetDomain(domain));
          } else {
            if (domains) {
              ctx.patchState({
                domains: [...domains, domain],
              });
            } else {
              ctx.patchState({
                domains: [domain],
              });
            }
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

    let sources = state.domain.sources;
    ctx.patchState({
      sources: sources,
    });

    let firstSource = true;

    for (let source of sources) {
      if (firstSource) {
        this.store.dispatch(new SetSource(source));
        firstSource = false;
        break;
      }
    }

    this.store.dispatch(new GetSources());
  }

  @Action(SetSource)
  setSource(ctx: StateContext<AppStateModel>, state: SetSource) {
    this.store.dispatch(new GetSourceDashBoardInfo());
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
  }

  @Action(AddNewSource)
  addNewSource(ctx: StateContext<AppStateModel>, state: AddNewSource) {
    // replace this with a function
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
      case 'tripadvisor':
        source_image_name = 'tripadvisor-logo.png';
        break;
      case 'youtube':
        source_image_name = 'youtube-logo.png';
        break;
      case 'googlereviews':
        source_image_name = 'google-reviews.png';
        break;
    }

    let selectedDomain = ctx.getState().selectedDomain;
    if (!selectedDomain) return;

    let domainID = selectedDomain.id;
    this.appApi
      .addSource(domainID, state.name, source_image_name, state.params)
      .subscribe((res) => {
        // Not sure as to whether i should just reget all the data or just use the response
        this.store.dispatch(new GetDomains());

        if (res.status === 'SUCCESS') {
          // refresh for the source that was just added
          this.store.dispatch(new RefreshSourceData(res.source_id));
        }
      });
  }

  @Action(RefreshSourceData)
  refreshSourceData(
    ctx: StateContext<AppStateModel>,
    state: RefreshSourceData
  ) {
    let sourceID = '';
    if (state.sourceId) {
      sourceID = state.sourceId;
    } else {
      let selectedSource = ctx.getState().selectedSource;
      if (!selectedSource) return;
      sourceID = selectedSource.id;
    }

    this.appApi.refreshSourceInfo(sourceID).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.toastr.error('Source data could not be refreshed', '', {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
          toastClass: 'custom-toast error ngx-toastr',
        });
        return;
      }
      this.store.dispatch(new GetSourceDashBoardInfo());
    });
  }

  @Action(AddNewDomain)
  addNewDomain(ctx: StateContext<AppStateModel>, state: AddNewDomain) {
    console.log(state);

    this.appApi
      .addDomain(state.domainName, state.description, state.domainImagUrl)
      .subscribe((res) => {
        if (res.status === 'FAILURE') {
          this.toastr.error('Your domain could not be added', '', {
            timeOut: 3000,
            positionClass: 'toast-bottom-center',
            toastClass: 'custom-toast error ngx-toastr',
          });
          return;
        }
        this.store.dispatch(new GetDomains());
      });
  }

  @Action(EditDomain)
  editDomain(ctx: StateContext<AppStateModel>, state: EditDomain) {
    // console.log(state);
    console.log('siffies');

    // call edit domain api

    // hard coded for now
    // let selectedDomain = ctx.getState().selectedDomain;
    // if (!selectedDomain) return;

    // selectedDomain.name = state.domainName;
    // selectedDomain.description = state.description;
    // // selectedDomain.imageUrl = state.domainImagUrl;

    // ctx.patchState({
    //   selectedDomain: selectedDomain,
    // });

    // let domains = ctx.getState().domains;
    // if (!domains) return;

    // for (let domain of domains) {
    //   if (domain.id == selectedDomain.id) {
    //     domain.name = state.domainName;
    //     domain.description = state.description;
    //     // domain.imageUrl = state.domainImagUrl;
    //     break;
    //   }
    // }
  }

  @Action(DeleteDomain)
  deleteDomain(ctx: StateContext<AppStateModel>, state: DeleteDomain) {
    this.appApi.removeDomain(state.domainID).subscribe((res) => {
      if (res.status === 'FAILURE') {
        // CHRIS ERROR HANDLE
        alert('CHRIS ERROR HANDLE');
        return;
      }

      // will hardcode removal instead of re-fetching domains for now
      this.store.dispatch(new GetDomains());
    });

    // let domains = ctx.getState().domains;
    // if (!domains) return;

    // for (let domain of domains) {
    //   if (domain.id == state.domainID) {
    //     let selectedDomain = ctx.getState().selectedDomain;
    //     if (selectedDomain && selectedDomain.id == state.domainID) {
    //       // switch to the next domain
    //       if (domains.length > 1) {
    //         let nextDomain = domains[0];
    //         if (nextDomain.id == state.domainID) {
    //           nextDomain = domains[1];
    //         }

    //         this.store.dispatch(new SetDomain(nextDomain));
    //       }
    //     }

    //     // remove domain from domains
    //     domains.splice(domains.indexOf(domain), 1);

    //     ctx.patchState({
    //       domains: domains,
    //     });

    //     break;
    //   }
    // }
  }

  @Action(GetSourceDashBoardInfo)
  getSourceDashBoardInfo(ctx: StateContext<AppStateModel>) {
    let selectedSource = ctx.getState().selectedSource;
    if (!selectedSource) {
      console.log('no source selected to get dashboard info for');
      return;
    }
    let selectedSourceID = selectedSource.id;

    this.appApi.getSourceSentimentData(selectedSourceID).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.toastr.error('Sentiment data could not be retrieved', '', {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
          toastClass: 'custom-toast error ngx-toastr',
        });
        return;
      }

      ctx.patchState({
        overallSentimentScores: res.aggregated_metrics,
        sampleData: res.individual_metrics,
      });
    });
  }

  @Action(CheckAuthenticate)
  checkAuthenticate(ctx: StateContext<AppStateModel>) {
    if (ctx.getState().authenticated) return;

    this.appApi.checkAuthenticate().subscribe((res: any) => {
      if (res.status == 'SUCCESS') {
        const userID: number = res.id;
        ctx.patchState({
          authenticated: true,
        });
        this.store.dispatch(new SetProfileDetails(userID));
      }
    });
  }

  @Action(AttempPsswdLogin)
  attempPsswdLogin(ctx: StateContext<AppStateModel>, state: AttempPsswdLogin) {
    console.log('attempting password login');

    this.appApi
      .attemptPsswdLogin(state.username, state.password)
      .subscribe((res) => {
        if (res.status == 'SUCCESS') {
          // set jwt in local storage
          localStorage.setItem('JWT', res.JWT);

          this.store.dispatch(new SetProfileDetails(res.id));
          this.store.dispatch(new GetDomains());
          this.router.navigate(['']);
        } else {
          this.ngZone.run(() => {
            this.toastr.error('Login failed', '', {
              timeOut: 3000,
              positionClass: 'toast-bottom-center',
              toastClass: 'custom-toast error ngx-toastr',
            });
          });
        }
      });
  }

  /* @Action(GetProfileID)
  getProfileID(ctx: StateContext<AppStateModel>) {
    this.appApi.getProfileID().subscribe((res: any) => {
      if (res.status == 'SUCCESS') {
        ctx.patchState({
          profileId: res.id,
        });
        return true;
      } else return false;
    });
  } */

  @Action(SetProfileDetails)
  setProfileDetails(
    ctx: StateContext<AppStateModel>,
    state: SetProfileDetails
  ) {
    this.appApi.getProfile(state.profileId).subscribe((res: any) => {
      if (res.status == 'SUCCESS') {
        this.appApi.getUserByID(res.userID).subscribe((res2: any) => {
          if (res.status == 'SUCCESS') {
            const profileDetails: ProfileDetails = {
              userId: res.userID,
              username: res2.username,
              email: res2.email,
              profileIconUrl: res.profileIcon,
            };

            ctx.patchState({
              profileDetails: profileDetails,
            });

            // localStorage.setItem('profileId', state.profileId.toString());
          }
        });
      }
    });
  }

  @Action(RegisterUser)
  registerUser(ctx: StateContext<AppStateModel>, state: RegisterUser) {
    this.appApi
      .registerUser(state.username, state.password, state.email)
      .subscribe((res) => {
        if (res.status == 'SUCCESS') {
          localStorage.setItem('JWT', res.JWT);
          this.router.navigate(['']);
        } else {
          this.ngZone.run(() => {
            this.toastr.error('Your account could not be registered', '', {
              timeOut: 3000,
              positionClass: 'toast-bottom-center',
              toastClass: 'custom-toast error ngx-toastr',
            });
          });
        }
      });
  }

  @Action(ChooseStatistic)
  chooseStatistic(ctx: StateContext<AppStateModel>, state: ChooseStatistic) {
    ctx.patchState({
      selectedStatisticIndex: state.statisticIndex,
    });
  }

  private formatResponseSources(responseSources: any[]): DisplaySource[] {
    let displaySources: DisplaySource[] = [];
    for (let responseSource of responseSources) {
      let displaySource: DisplaySource = {
        id: responseSource.source_id,
        name: responseSource.source_name,
        url: responseSource.source_icon,
        selected: false,
      };
      displaySources.push(displaySource);
    }
    return displaySources;
  }
}
