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
  ToastError,
  ToastSuccess,
  ChangeProfileIcon,
} from './app.actions';
import { Router } from '@angular/router';
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

export interface Toast {
  message: string;
  timeout: number;
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
  toasterError?: Toast;
  toasterSuccess?: Toast;
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
    private readonly router: Router
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

  @Selector()
  static toasterError(state: AppStateModel) {
    if (state.toasterError) return state.toasterError;
    return undefined;
  }

  @Selector()
  static toasterSuccess(state: AppStateModel) {
    if (state.toasterSuccess) return state.toasterSuccess;
    return undefined;
  }

  @Action(ToastError)
  toastError(ctx: StateContext<AppStateModel>, action: ToastError) {
    const toast: Toast = {
      message: action.message,
      timeout: action.timeout ? action.timeout : 3000,
    };

    ctx.patchState({ toasterError: toast });
  }

  @Action(ToastSuccess)
  toastSuccess(ctx: StateContext<AppStateModel>, action: ToastSuccess) {
    const toast: Toast = {
      message: action.message,
      timeout: action.timeout ? action.timeout : 3000,
    };
    ctx.patchState({ toasterSuccess: toast });
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
        this.store.dispatch(
          new ToastError('Your domains could not be retrieved')
        );
        return;
      }

      let domainIDs: string[] = res.domainIDs;

      let firstDomain = true;

      domainIDs.map((domainID: string) => {
        this.appApi.getDomainInfo(domainID).subscribe((res: any) => {
          if (res.status === 'FAILURE') {
            this.store.dispatch(
              new ToastError('Your domains could not be retrieved')
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

    console.log('refreshing with sourceID' + sourceID);
    this.appApi.refreshSourceInfo(sourceID).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.store.dispatch(
          new ToastError('Source data could not be refreshed')
        );
        if (selectedSource) {
          selectedSource.isRefreshing = false;
          ctx.patchState({
            selectedSource,
          });
        }

        return;
      }
      this.store.dispatch(new GetSourceDashBoardInfo());

      if (selectedSource) {
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
          this.store.dispatch(new ToastError('Your domain could not be added'));
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
        this.store.dispatch(new ToastError('Source data could not be loaded'));
        return;
      }

      ctx.patchState({
        overallSentimentScores: {
          aggregated_metrics: res.aggregated_metrics,
          meta_data: res.meta_data,
        },
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
          this.store.dispatch(new ToastError('Login failed'));
          return throwError(() => new Error('Login failed'));
        }
      }),
      catchError((error: any) => {
        return of(error);
      })
    );
  }

  @Action(SetUserDetails)
  setUserDetails(ctx: StateContext<AppStateModel>, state: SetUserDetails) {
    this.appApi.getProfile(state.profileId).subscribe((res: any) => {
      if (res.status == 'SUCCESS') {
        const profileDetails: ProfileDetails = {
          profileId: res.id,
          profileIcon: res.profileIcon,
          mode: res.mode,
        };

        this.appApi.getUserByID(res.userID).subscribe((res2: any) => {
          if (res2.status == 'SUCCESS') {
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
    return this.appApi
      .registerUser(state.username, state.password, state.email)
      .pipe(
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
          this.store.dispatch(
            new ToastError('Your account could not be registered')
          );
          return of(error);
        })
      );
  }

  @Action(ChangePassword)
  changePassword(ctx: StateContext<AppStateModel>, state: UserDetails) {
    //check UserDetails

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
          this.store.dispatch(
            new ToastSuccess('Your password has been changed')
          );
          this.router.navigate(['/login']);
        } else {
          this.store.dispatch(
            new ToastError('Your password could not be changed')
          );
        }
      });
  }

  @Action(ChangeProfileIcon)
  changeProfileIcon(ctx: StateContext<AppStateModel>, state: ProfileDetails) {
    const profileId = ctx.getState().profileDetails?.profileId;

    if (!profileId) {
      console.error('Profile ID is not available in the state.');
      return;
    }

    const { profileIcon } = state;

    if (profileIcon === undefined) {
      console.error('profileIcon must be provided.');
      return;
    }

    return this.appApi.changeProfileIcon(profileId, profileIcon).pipe(
      switchMap((res) => {
        if (res.status === 'SUCCESS') {
          console.log('profile icon changed');
          console.log(res.profileIcon);
          const profileDetails: ProfileDetails = {
            profileId: res.id,
            profileIcon: res.profileIcon,
            mode: res.mode,
          };

          ctx.patchState({
            profileDetails: profileDetails,
          });
          return this.store.dispatch(
            new ToastSuccess('Your profile icon has been changed')
          );
        } else {
          return this.store.dispatch(
            new ToastError('Your profile icon could not be changed')
          );
        }
      }),
      catchError((error: any) => {
        console.error(
          'An error occurred during the profile icon change:',
          error
        );
        return throwError(() => error);
      })
    );
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
      this.store.dispatch(new ToastError('Your theme could not be changed'));
      return;
    }

    this.appApi.changeMode(profileId).subscribe((res) => {
      if (res.status == 'SUCCESS') {
        const profileDetails: ProfileDetails = {
          profileId: res.id,
          profileIcon: res.profileIcon,
          mode: res.mode,
        };

        ctx.patchState({
          profileDetails: profileDetails,
        });

        this.store.dispatch(new ToastSuccess('Your theme has been updated'));
      } else {
        this.store.dispatch(new ToastError('Your theme could not be changed'));
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
