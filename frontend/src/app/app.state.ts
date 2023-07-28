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
  SetUserDetails,
  RefreshSourceData,
  SetSourceIsLoading,
  ChangePassword,
  ChangeMode,
  Initialise,
} from './app.actions';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgZone } from '@angular/core';
import { catchError, of, switchMap, throwError } from 'rxjs';

export interface Source {
  source_id: string;
  source_name: string;
  sourceImageUrl: string;
}
export interface DisplayDomain {
  id: string;
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

export interface UserDetails {
  userId: number;
  username: string;
  email: string;
  profileIconUrl: string;
  oldPassword?: string;
  newPassword?: string;
}

export interface ProfileDetails {
  profileId: number;
  mode: boolean;
  profileIcon: string;
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
  userDetails?: UserDetails;
  sourceIsLoading: boolean;
  profileDetails?: ProfileDetails;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    authenticated: false,
    selectedStatisticIndex: 0,
    sourceIsLoading: true,
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
          if (res.app?.userDetails) {
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
  static userDetails(state: AppStateModel) {
    if (state.userDetails) return state.userDetails;
    return undefined;
  }

  @Selector()
  static sourceIsLoading(state: AppStateModel) {
    if (state.sourceIsLoading) return state.sourceIsLoading;
    return false;
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
    const userDetails = ctx.getState().userDetails;
    if (!userDetails) return;

    this.appApi.getDomainIDs(userDetails.userId).subscribe((res: any) => {
      if (res.status === 'FAILURE') {
        
        this.ngZone.run(() => {
          this.toastr.error('Your domains could not be retrieved', '', {
            timeOut: 3000,
            positionClass: 'toast-bottom-center',
            toastClass: 'custom-toast error ngx-toastr',
          });
        });
        return;
      }

      let domainIDs: string[] = res.domainIDs;

      let firstDomain = true;

      domainIDs.map((domainID: string) => {
        this.appApi.getDomainInfo(domainID).subscribe((res: any) => {
          if (res.status === 'FAILURE') {
            this.ngZone.run(() => {
            this.toastr.error(
              'The info for one of your domains could not be retrieved',
              '',
              {
                timeOut: 3000,
                positionClass: 'toast-bottom-center',
                toastClass: 'custom-toast error ngx-toastr',
              }
            );
            });

            
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
            sources: AppState.formatResponseSources(domainRes.sources),
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
    let sources = ctx.getState().sources;
    if (!sources) return;

    for (let souce of sources) {
      souce.selected = false;
    }
    state.source.selected = true;

    this.store.dispatch(new GetSourceDashBoardInfo());

    ctx.patchState({
      sources: sources,
      selectedSource: state.source,
      /*       sourceIsLoading: false, */
    });
  }

  @Action(AddNewSource)
  addNewSource(ctx: StateContext<AppStateModel>, state: AddNewSource) {
    // replace this with a function
    let source_image_name = AppState.platformToIcon(state.platform);

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
          this.ngZone.run(() => {
          this.toastr.error('Your domain could not be added', '', {
            timeOut: 3000,
            positionClass: 'toast-bottom-center',
            toastClass: 'custom-toast error ngx-toastr',
          });
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
        this.ngZone.run(() => {
        this.toastr.error('Sentiment data could not be retrieved', '', {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
          toastClass: 'custom-toast error ngx-toastr',
        });
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
    if (ctx.getState().authenticated) return;

    this.appApi.checkAuthenticate().subscribe((res: any) => {
      if (res.status == 'SUCCESS') {
        const userID: number = res.id;
        ctx.patchState({
          authenticated: true,
        });
        this.store.dispatch(new SetUserDetails(userID));
      }
    });
  }



// ...

@Action(AttempPsswdLogin)
attempPsswdLogin(ctx: StateContext<AppStateModel>, state: AttempPsswdLogin) {
  console.log('attempting password login');

  return this.appApi.attemptPsswdLogin(state.username, state.password).pipe(
    switchMap((res) => {
      if (res.status === 'SUCCESS') {
        // set jwt in local storage
        localStorage.setItem('JWT', res.JWT);

        this.store.dispatch(new SetUserDetails(res.id));
        this.store.dispatch(new GetDomains());
        this.router.navigate(['']);
        return of(res);
      } else {
        this.ngZone.run(() => {
          this.toastr.error('Login failed', '', {
            timeOut: 3000,
            positionClass: 'toast-bottom-center',
            toastClass: 'custom-toast error ngx-toastr',
          });
        });
        return throwError(() => new Error('Login failed'));
      }
    }),
    catchError((error: any) => {

      return of(error);
    })
  );
}

  @Action(SetUserDetails)
  setUserDetails(
    ctx: StateContext<AppStateModel>,
    state: SetUserDetails
  ) {
    this.appApi.getProfile(state.profileId).subscribe((res: any) => {
      if (res.status == 'SUCCESS') {
        const profileDetails: ProfileDetails = {
          profileId: res.id,
          profileIcon: res.profileIcon,
          mode: res.mode,
        }


        this.appApi.getUserByID(res.userID).subscribe((res2: any) => {
          if (res.status == 'SUCCESS') {
            const userDetails: UserDetails = {
              userId: res.userID,
              username: res2.username,
              email: res2.email,
              profileIconUrl: res.profileIcon,
              oldPassword: res2.password,

            };

            ctx.patchState({
              userDetails: userDetails,
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
  return this.appApi.registerUser(state.username, state.password, state.email).pipe(
    switchMap((res) => {
      if (res.status === 'SUCCESS') {
        localStorage.setItem('JWT', res.JWT);
        /* this.router.navigate(['']); */
        console.log('register success');
        return of();
      } else {

        return throwError(() => new Error());
      }
    }),
    catchError((error: any) => {
      this.ngZone.run(() => {
        this.toastr.error('Your account could not be registered', '', {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
          toastClass: 'custom-toast error ngx-toastr',
        });
      });
      return of(error);
    })
  );
}

  @Action(ChangePassword)
  changePassword(ctx: StateContext<AppStateModel>, state: UserDetails) {//check UserDetails

    const userId = ctx.getState().userDetails?.userId;

    if (!userId) {
      console.error('User ID is not available in the state.');
      return;
    }

    

    const { oldPassword, newPassword } = state;

    if (oldPassword === undefined || newPassword === undefined) {
      console.error('oldPassword and newPassword must be provided.');
      return;
    }

    this.appApi
      .changePassword(userId, oldPassword, newPassword)
      .subscribe((res) => {
        if (res.status == 'SUCCESS') {
          this.ngZone.run(() => {
            this.toastr.success('Your password has been changed', '', {
              timeOut: 3000,
              positionClass: 'toast-bottom-center',
              toastClass: 'custom-toast success ngx-toastr',
            });
          });
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

  @Action(ChangeMode)
  changeMode(ctx: StateContext<AppStateModel>, state: ProfileDetails) {
    const profileId = ctx.getState().profileDetails?.profileId;

    if (!profileId) {
      console.error('Profile ID is not available in the state.');
      this.ngZone.run(() => {
        this.toastr.error('Your theme could not be changed', '', {
          timeOut: 3000,
          positionClass: 'toast-bottom-center',
          toastClass: 'custom-toast error ngx-toastr',
        });
      });
      return;
    }

    this.appApi
      .changeMode(profileId)
      .subscribe((res) => {
        if (res.status == 'SUCCESS') {
          const profileDetails: ProfileDetails = {
            profileId: res.id,
            profileIcon: res.profileIcon,
            mode: res.mode,
          }

          ctx.patchState({
            profileDetails: profileDetails,
          });

          this.ngZone.run(() => {
            this.toastr.success('Your theme has been updated', '', {
              timeOut: 3000,
              positionClass: 'toast-bottom-center',
              toastClass: 'custom-toast success ngx-toastr',
            });
          });
        } else {
          this.ngZone.run(() => {
            this.toastr.error('Your theme could not be changed', '', {
              timeOut: 3000,
              positionClass: 'toast-bottom-center',
              toastClass: 'custom-toast error ngx-toastr',
            });
          });
        }
      });
  }

  

  static formatResponseSources(responseSources: any[]): DisplaySource[] {
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

  static platformToIcon(platform: string): string {
    let source_image_name = '';
    switch (platform) {
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
    return source_image_name;
  }
}
