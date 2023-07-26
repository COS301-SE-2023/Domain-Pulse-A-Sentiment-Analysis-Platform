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
  SetProfileId,
  SetSource,
  GetSourceDashBoardInfo,
  ChooseStatistic,
  EditDomain,
  DeleteDomain,
  Demo2Setup,
  SetProfileDetails,
  RefreshSourceData,
  SetSourceIsLoading,
  ChangePassword,
} from './app.actions';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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
  isRefreshing: boolean;
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
  oldPassword?: string;
  newPassword?: string;
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
  // overallSentimentScores?: SentimentScores;
  overallSentimentScores?: any;
  // sampleData?: Comment[];
  sampleData?: any[];
  selectedStatisticIndex: number;
  profileDetails?: ProfileDetails;
  sourceIsLoading: boolean;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    profileId: 1,
    authenticated: false,
    selectedStatisticIndex: 0,
    sourceIsLoading: false,
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
    this.store.dispatch(new CheckAuthenticate());
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

  @Selector()
  static sourceIsLoading(state: AppStateModel) {
    if (state.sourceIsLoading) return state.sourceIsLoading;
    return false;
  }
  

  @Action(GetDomains)
  getDomains(ctx: StateContext<AppStateModel>) {
    this.appApi.getDomainIDs(ctx.getState().profileId).subscribe((res: any) => {
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
            firstDomain = false;
            this.store.dispatch(new SetDomain(domain));
          }

          /* ctx.patchState({
            sourceIsLoading: false,
          }); */
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
      /*       sourceIsLoading: false, */
    });
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
    let selectedSource = ctx.getState().selectedSource;
    let sourceID = '';
    if (state.sourceId) {
      sourceID = state.sourceId;
    } else {
      if (!selectedSource) return;
      sourceID = selectedSource.id;

      selectedSource.isRefreshing = true;
      ctx.patchState({
        selectedSource,
      });
    }

    console.log("refreshing with sourceID" + sourceID)
    this.appApi.refreshSourceInfo(sourceID).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.ngZone.run(() => {
          this.toastr.error('Source data could not be refreshed: ' + res.details , '', {
            timeOut: 3000,
            positionClass: 'toast-bottom-center',
            toastClass: 'custom-toast error ngx-toastr',
          });
        });

        if(selectedSource){
          selectedSource.isRefreshing = false;
          ctx.patchState({
            selectedSource,
          });
        }

        return;
      }
      this.store.dispatch(new GetSourceDashBoardInfo());
      
      if(selectedSource){
        selectedSource.isRefreshing = false;
        ctx.patchState({
          selectedSource,
        });
      }
      
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

        let userID = ctx.getState().profileId;
        this.appApi
          .linkDomainToProfile(res.new_domain.id, userID)
          .subscribe((res2) => {
            console.log(res2);

            if (res2.status === 'FAILURE') {
              this.toastr.error(
                'Your domain could not be linked to your profile',
                '',
                {
                  timeOut: 3000,
                  positionClass: 'toast-bottom-center',
                  toastClass: 'custom-toast error ngx-toastr',
                }
              );
              return;
            }

            this.store.dispatch(new GetDomains());
          });
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
      // this.store.dispatch(new GetDomains());
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
        sourceIsLoading: false,
      });
    });
  }

  @Action(CheckAuthenticate)
  checkAuthenticate(ctx: StateContext<AppStateModel>) {
    this.appApi.checkAuthenticate().subscribe((res: any) => {
      if (res.status == 'SUCCESS') {
        // There is no res.id, one should store the userID in local storage
        ctx.patchState({
          profileId: res.id,
        });
        return true;
      } else return false;
    });
  }

  @Action(AttempPsswdLogin)
  attempPsswdLogin(ctx: StateContext<AppStateModel>, state: AttempPsswdLogin) {
    console.log('attempting password login');

    this.appApi
      .attemptPsswdLogin(state.username, state.password)
      .subscribe((res) => {
        if (res.status == 'SUCCESS') {
          this.store.dispatch(new SetProfileId(res.id));
          console.log('here');
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

  @Action(SetProfileId)
  setProfileId(ctx: StateContext<AppStateModel>, state: SetProfileId) {
    ctx.patchState({
      profileId: state.profileId,
    });
    /* //just testing
    console.log(state.profileId);
    localStorage.setItem('profileID', JSON.stringify(state.profileId)); */
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
            ctx.patchState({
              profileDetails: {
                userId: res.userID,
                username: res2.username,
                email: res2.email,
                profileIconUrl: res.profileIconUrl,
              },
            });

            localStorage.setItem('profileId', state.profileId.toString());

            return true;
          } else return false;
        });
        return true;
      } else return false;
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

  @Action(ChangePassword)
  changePassword(ctx: StateContext<AppStateModel>, state: ChangePassword) {//check ProfileDetails

    const userId = ctx.getState().profileDetails?.userId;

    if (!userId) {
      console.error('User ID is not available in the state.');
      return;
    }

    this.appApi
      .changePassword(state.oldPassword, state.newPassword)
      .subscribe((res) => {
        if (res.status == 'SUCCESS') {
          this.router.navigate(['']);
        } else {
          this.ngZone.run(() => {
            this.toastr.error('Your password could not be changed', '', {
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

  @Action(SetSourceIsLoading)
  setSourceIsLoading(
    ctx: StateContext<AppStateModel>,
    action: SetSourceIsLoading
  ) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      sourceIsLoading: true,
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
        isRefreshing: false,
      };
      displaySources.push(displaySource);
    }
    return displaySources;
  }
}
