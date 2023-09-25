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
  DeleteSource,
  DeleteUser,
  Logout,
  EditSource,
  SetAllSourcesSelected,
  SetIsActive,
  UplaodCVSFile,
  GenerateReport,
  AttempGuestLogin,
  GuestModalChange
} from './app.actions';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, throwError } from 'rxjs';
import { patch } from '@ngxs/store/operators';

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
  params: any;
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
  password?: string;
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

interface AppStateModel {
  authenticated: boolean;
  pdfLoading: boolean;
  userHasNoDomains: boolean;
  userHasNoSources: boolean;
  allSourcesSelected: boolean;
  sourceIsLoading: boolean;
  selectedStatisticIndex: number;
  canEdit: boolean;
  showMakeAccountModal: boolean;
  domains?: DisplayDomain[];
  selectedDomain?: DisplayDomain;
  sources?: DisplaySource[];
  selectedSource?: DisplaySource;
  // overallSentimentScores?: SentimentScores;
  overallSentimentScores?: any;
  // sampleData?: Comment[];
  sampleData?: any[];
  userDetails?: UserDetails;
  profileDetails?: ProfileDetails;
  toasterError?: Toast;
  toasterSuccess?: Toast;
  pdfUrl?: string;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    authenticated: false,
    selectedStatisticIndex: 0,
    sourceIsLoading: true,
    allSourcesSelected: true,
    pdfLoading: false,
    pdfUrl: '',
    userHasNoDomains: false,
    userHasNoSources: false,
    canEdit: false,
    showMakeAccountModal: false,
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
    return state.sourceIsLoading;
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

  @Selector()
  static allSourcesSelected(state: AppStateModel) {
    return state.allSourcesSelected;
  }

  @Selector()
  static pdfUrl(state: AppStateModel) {
    return state.pdfUrl;
  }

  @Selector()
  static pdfLoading(state: AppStateModel) {
    return state.pdfLoading;
  }
  
  @Selector()
  static userHasNoDomains(state: AppStateModel) {
    return state.userHasNoDomains;
  }

  @Selector()
  static userHasNoSources(state: AppStateModel) {
    return state.userHasNoSources;
  }

  @Selector()
  static showMakeAccountModal(state: AppStateModel) {
    return state.showMakeAccountModal;
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

      ctx.patchState({
        userHasNoDomains: domainIDs.length === 0,
      });

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
            imageUrl: domainRes.icon,
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

          this.store.dispatch(new SetSource(null));

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
      userHasNoSources: state.domain.sources.length === 0,
    });

    ctx.patchState({
      domains: domains,
      selectedDomain: state.domain,
    });

    localStorage.setItem('selectedDomain', state.domain.id);

    let sources = state.domain.sources;
    ctx.patchState({
      sources: sources,
    });

    const selectedSourceId = localStorage.getItem(state.domain.id);
    if (selectedSourceId == '') {
      this.store.dispatch(new SetSource(null));
    } else {
      const selectedSource = sources.find(
        (source) => source.id === selectedSourceId
      );

      // If the selectedSource is found, set it to local storage
      if (selectedSource) {
        this.store.dispatch(new SetSource(selectedSource));
      }
    }

    /* let found = false;

    for (let source of sources) {
      if (source.selected) {
        this.store.dispatch(new SetSource(source));
        break;
      }
    }

    if (!found) {
      this.store.dispatch(new SetSource(null));
    } */

    this.store.dispatch(new GetSources());
  }

  @Action(SetSource)
  setSource(ctx: StateContext<AppStateModel>, state: SetSource) {
    const sources = ctx.getState().sources;
    if (!sources) return;

    for (const source of sources) {
      source.selected = false;
    }

    if (!state.source) {
      ctx.patchState({
        allSourcesSelected: true,
        selectedSource: undefined,
      });
      this.store.dispatch(new GetSourceDashBoardInfo());

      return;
    }

    const selectedDomain = localStorage.getItem('selectedDomain');
    if (!selectedDomain) return;

    localStorage.setItem(selectedDomain, state.source.id);
    state.source.selected = true;

    this.store.dispatch(new GetSourceDashBoardInfo());

    ctx.patchState({
      sources: sources,
      selectedSource: state.source,
      allSourcesSelected: false,
    });
  }

  @Action(AddNewSource)
  addNewSource(ctx: StateContext<AppStateModel>, state: AddNewSource) {
    // replace this with a function
    let source_image_name = AppState.platformToIcon(state.platform);

    let selectedDomain = ctx.getState().selectedDomain;
    if (!selectedDomain) return;

    let domainID = selectedDomain.id;

    return this.appApi
    .addSource(domainID, state.name, source_image_name, state.params)
    .pipe(
      switchMap((res) => {
        if (res.status === 'FAILURE') {
          this.store.dispatch(
            new ToastError('Your source could not be added')
          );
          return of(res);
        } else {

          console.log("added this source: ");
          console.log(res)
          let domainRes = res.domain;
          let domainsIDs = domainRes.sources.map(
            (source: any) => source.source_id
          );
          let selectedDomain: DisplayDomain = {
            id: domainRes._id,
            name: domainRes.name,
            description: domainRes.description,
            imageUrl: domainRes.icon,
            sourceIds: domainsIDs,
            sources: AppState.formatResponseSources(domainRes.sources),
            selected: false,
          };
  
          let domains = ctx.getState().domains;
          if (!domains) return of(null);
  
          this.store.dispatch(new SetDomain(selectedDomain));
  
          let lastSource =
            selectedDomain.sources[selectedDomain.sources.length - 1];
  
          this.store.dispatch(new SetSourceIsLoading(true));
          this.store.dispatch(new SetSource(lastSource));
          console.log("identifier3: " + state.platform)
          if(state.platform == "livereview" || state.platform == "csv"){
            console.log("live review here")
            this.store.dispatch(new GetSourceDashBoardInfo());
          }
          else{
            lastSource.isRefreshing = true;
            this.store.dispatch(new RefreshSourceData(res.domain.new_source_id));
          }
          console.log("identifier4: " + res.domain.new_source_id)
          return of(res.domain.new_source_id);
        }
      })
    );
    
  }

  /*  @Action(EditSource)
  editSource(ctx: StateContext<AppStateModel>, state: EditSource) {
    let selectedDomain = ctx.getState().selectedDomain;
    if (!selectedDomain) return;

    let selectedSource = ctx.getState().selectedSource;
    if (!selectedSource) return;

    let sourceID = selectedSource.id;

    this.appApi.editSource(sourceID, state.name).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.store.dispatch(new ToastError('Your source could not be edited'));
        return;
      }else if(res.status === 'SUCCESS'){
        this.store.dispatch(new ToastSuccess('Your source has been edited'));
        if(!selectedSource) return;

        let updatedSelectedSource: DisplaySource = {
          id: selectedSource.id,
          name: state.name,
          url: selectedSource.url,
          selected: selectedSource.selected,
          params: selectedSource.params,
          isRefreshing: selectedSource.isRefreshing,
        };
        ctx.patchState({ selectedSource: updatedSelectedSource });
      }

    });



  } */

  @Action(GuestModalChange)
  guestModalChange(ctx: StateContext<AppStateModel>, state: GuestModalChange) {
    ctx.patchState({ showMakeAccountModal: state.show });
  }

  @Action(EditSource)
  editSource(ctx: StateContext<AppStateModel>, state: EditSource) {
    const currentState = ctx.getState();
    const sources = currentState.sources || [];
    const selectedSource = currentState.selectedSource;

    if (!selectedSource) {
      this.store.dispatch(new ToastError('No selected source to edit'));
      return;
    }

    const sourceID = selectedSource.id;
    this.appApi.editSource(sourceID, state.name).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.store.dispatch(new ToastError('Your source could not be edited'));
        return;
      } else if (res.status === 'SUCCESS') {
        this.store.dispatch(new ToastSuccess('Your source has been edited'));

        const updatedSources = sources.map((source) => {
          if (source.id === sourceID) {
            return { ...source, name: state.name };
          }
          return source;
        });

        ctx.patchState({
          sources: updatedSources,
          selectedSource: { ...selectedSource, name: state.name },
        });
      }
    });
  }

  @Action(DeleteSource)
  deleteSource(ctx: StateContext<AppStateModel>, state: DeleteSource) {
    let selectedDomain = ctx.getState().selectedDomain;
    if (!selectedDomain) return;

    let selectedSource = ctx.getState().selectedSource;
    if (!selectedSource) return;

    let sourceID = selectedSource.id;
    let domainID = selectedDomain.id;
    this.appApi.deleteSource(domainID, sourceID).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.store.dispatch(new ToastError('Your source could not be added'));
        return;
      }

      let domainRes = res.confirmation;
      let domainsIDs = domainRes.sources.map((source: any) => source.source_id);
      let selectedDomain: DisplayDomain = {
        id: domainRes._id,
        name: domainRes.name,
        description: domainRes.description,
        imageUrl: domainRes.icon,
        sourceIds: domainsIDs,
        sources: AppState.formatResponseSources(domainRes.sources),
        selected: false,
      };

      let domains = ctx.getState().domains;
      if (!domains) return;

      for (let domain of domains) {
        if (domain.id == selectedDomain.id) {
          domain = selectedDomain;
          ctx.patchState({
            domains: domains,
          });
          break;
        }
      }

      this.store.dispatch(new SetDomain(selectedDomain));

      if (selectedDomain.sources.length === 0) {
        return;
      }

      let firstSource = selectedDomain.sources[0];
      this.store.dispatch(new SetSource(firstSource));
    });
  }

  @Action(RefreshSourceData)
  refreshSourceData(
    ctx: StateContext<AppStateModel>,
    state: RefreshSourceData
  ) {
    let selectedSource = ctx.getState().selectedSource;
    console.log(selectedSource)
    console.log(selectedSource?.params)
    console.log(selectedSource?.params?.source_type)
    if(selectedSource?.url == "live-review-logo.png" || selectedSource?.url == "csv-logo.png"){
      console.log("live review here")
      if (!selectedSource) return;

      selectedSource.isRefreshing = true;
      ctx.patchState({
        selectedSource,
      });

      this.store.dispatch(new GetSourceDashBoardInfo());

      if (selectedSource) {
        selectedSource.isRefreshing = false;
        ctx.patchState({
          selectedSource,
        });
      }
      this.store.dispatch(
        new ToastSuccess('Your source has been refreshed')
      );

      return;
    }
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
      this.store.dispatch(
        new ToastSuccess('Your source has been refreshed')
      );
    });
  }

  @Action(AddNewDomain)
  addNewDomain(ctx: StateContext<AppStateModel>, state: AddNewDomain) {
    console.log(state);

    return this.appApi
      .addDomain(state.domainName, state.description, state.domainImagUrl)
      .pipe(
        switchMap((res) => {
          if (res.status === 'FAILURE') {
            this.store.dispatch(
              new ToastError('Your domain could not be added')
            );
            return of(res);
          } else {
            this.store.dispatch(new ToastSuccess('Your domain has been added'));
            this.store.dispatch(new GetDomains());
            return of(res);
          }
        }),
        catchError((error: any) => {
          this.store.dispatch(
            new ToastError('An error occurred while adding the domain')
          );
          return throwError(
            () => new Error('Error occurred while adding the domain')
          );
        })
      );
  }

  @Action(EditDomain)
  editDomain(ctx: StateContext<AppStateModel>, state: EditDomain) {
    return this.appApi
      .editDomain(
        state.domainId,
        state.domainName,
        state.domainImageUrl,
        state.description
      )
      .pipe(
        switchMap((res) => {
          if (res.status === 'SUCCESS') {
            this.store.dispatch(
              new ToastSuccess('Your domain has been updated')
            );
            this.store.dispatch(new GetDomains());

            /* const currentState = ctx.getState();
            console.log(state.domainId);
            console.log(currentState.domains?.at(0));
            const existingDomain = currentState.domains?.find(
              (domain) => domain.id == res.id
            );

            const domains = currentState.domains;

            if (domains) {
              let index = 0;

              while (index < domains.length) {
                const currentDomain = domains[index];
                if(currentState.domains?.at(index)?.id == state.domainId){
                  console.log('found');
                 
                  
                  domains[index] = res.domain;
                  console.log(domains[index]);
                  console.log(res.domain);
                  console.log(res);
                }

                index++;
              }
            }
 */

            /*  if (!existingDomain) {
              return throwError(() => new Error('Domain not found'));
            }

            const updatedDomain: DisplayDomain = {
              ...existingDomain, 
              name: res.name,
              description: res.description,
              imageUrl: res.icon,
              selected: true, // You need to set this value appropriately
            };

            const updatedDomains = currentState.domains?.map((domain) =>
              domain.id === res.id ? updatedDomain : domain
            );

            return ctx.dispatch(patch({ domains: updatedDomains }));
 */
            return of(res);
          } else {
            this.store.dispatch(
              new ToastError('Your domain could not be updated')
            );
            return throwError(() => new Error('edit domain failed'));
          }
        }),
        catchError((error: any) => {
          return of(error);
        })
      );
  }

  @Action(DeleteDomain)
  deleteDomain(ctx: StateContext<AppStateModel>, state: DeleteDomain) {
    this.appApi.removeDomain(state.domainID).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.store.dispatch(new ToastError('There was a problem deleting the domain'));

      }

      this.store.dispatch(new GetDomains());
    });
  }

  @Action(GetSourceDashBoardInfo)
  getSourceDashBoardInfo(ctx: StateContext<AppStateModel>) {
    let selectedSource = ctx.getState().selectedSource;
    if (!selectedSource) {
      let selectedDomain = ctx.getState().selectedDomain;
      if (!selectedDomain) return;
      const sourceIds = selectedDomain.sourceIds;
      this.appApi.getAggregatedDomainData(sourceIds).subscribe((res) => {
        if (res.status == 'SUCCESS') {
          ctx.patchState({
            overallSentimentScores: {
              aggregated_metrics: res.aggregated_metrics,
              meta_data: res.meta_data,
              timeseries: res.timeseries,
            },
            sampleData: res.individual_metrics,
            sourceIsLoading: false,
          });
        }
      });
      return;
    }
    let selectedSourceID = selectedSource.id;

    this.appApi.getSourceSentimentData(selectedSourceID).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.store.dispatch(new ToastError('Source data could not be loaded'));

      }

      if (res.aggregated_metrics)
        if (res.aggregated_metrics.general.category == 'No data') {
          this.store.dispatch(new SetSourceIsLoading(true));
        } else {
          ctx.patchState({
            overallSentimentScores: {
              aggregated_metrics: res.aggregated_metrics,
              meta_data: res.meta_data,
              timeseries: res.timeseries,

            },
            sampleData: res.individual_metrics,
            sourceIsLoading: false,
          });
        }
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

  @Action(AttempGuestLogin)
  attempGuestLogin(ctx: StateContext<AppStateModel>, state: AttempGuestLogin) {
    this.appApi.attemptGuestLogin().subscribe((res) => {
      if(res.status === "SUCCESS") {
        this.store.dispatch(new AttempPsswdLogin('guest', res.guest_token));
      } else {
        this.store.dispatch(new ToastError('Preview disabled, please try again later'));
      }
    });
  }

  @Action(AttempPsswdLogin)
  attempPsswdLogin(ctx: StateContext<AppStateModel>, state: AttempPsswdLogin) {
    console.log('attempting password login');

    return this.appApi.attemptPsswdLogin(state.username, state.password).pipe(
      switchMap((res) => {
        if (res.status === 'SUCCESS') {
          // set jwt in local storage
          localStorage.setItem('JWT', res.JWT);

          if(state.username == 'guest') {
            const canEditFlag = localStorage.getItem('canEdit');
            if(canEditFlag && canEditFlag == 'true') {
              ctx.patchState({
                canEdit: true
              });
            } else {
              ctx.patchState({
                canEdit: false
              });
            }

            localStorage.setItem('canEdit', ctx.getState().canEdit.toString());

            this.store.dispatch(new ToastSuccess('You are currenly viewing a preview'));
          }

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

            this.store.dispatch(new GetDomains());
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
          return throwError(() => new Error());
        })
      );
  }

  @Action(Logout)
  logout(ctx: StateContext<AppStateModel>) {
    this.appApi.logOut().subscribe((res) => {
      if (res.status === 'SUCCESS') {
        localStorage.removeItem('JWT');
        ctx.patchState({
          authenticated: false,
          selectedStatisticIndex: 0,
          sourceIsLoading: true,
          allSourcesSelected: true,
          pdfLoading: false,
          pdfUrl: '',
          userHasNoDomains: false,
          userHasNoSources: false,
          domains: undefined,
          selectedDomain: undefined,
          sources: undefined,
          selectedSource: undefined,
          overallSentimentScores: undefined,
          sampleData: undefined,
          userDetails: undefined,
          profileDetails: undefined,
          toasterError: undefined,
          toasterSuccess: undefined,
        });
        this.router.navigate(['/login']);
        this.store.dispatch(new ToastSuccess('You have been logged out'));
      } else {
        this.store.dispatch(new ToastError('You could not be logged out'));
      }
    });
  }

  @Action(ChangePassword)
  changePassword(ctx: StateContext<AppStateModel>, state: ChangePassword) {
    //check UserDetails

    const userId = ctx.getState().userDetails?.userId;

    if (!userId) {
      console.error('User ID is not available in the state.');
      return;
    }

    const { oldPassword, newPassword } = state;

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

  @Action(DeleteUser)
  deleteUser(ctx: StateContext<AppStateModel>, state: DeleteUser) {
    const { password, username } = state;

    this.appApi.deleteUser(username, password).subscribe((res) => {
      if (res.status == 'SUCCESS') {
        this.store.dispatch(new ToastSuccess('Your account has been deleted'));
        localStorage.removeItem('JWT');
        this.router.navigate(['/login']);
      } else {
        this.store.dispatch(
          new ToastError('Your account could not be deleted')
        );
      }
    });
  }

  @Action(ChangeProfileIcon)
  changeProfileIcon(ctx: StateContext<AppStateModel>, state: ChangeProfileIcon) {
    const profileId = ctx.getState().profileDetails?.profileId;

    if (!profileId) {
      console.error('Profile ID is not available in the state.');
      return;
    }

    const { profileIcon } = state;

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
    ctx.patchState({
      sourceIsLoading: true,
    });
  }

  @Action(SetAllSourcesSelected)
  setAllSourcesSelected(
    ctx: StateContext<AppStateModel>,
    { selected }: SetAllSourcesSelected
  ) {
    ctx.patchState({ allSourcesSelected: selected });
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

  @Action(SetIsActive)
  setIsActive(ctx: StateContext<AppStateModel>, state: SetIsActive) {

    const currentState = ctx.getState();
    const selectedSource = currentState.selectedSource;
    const sources = currentState.sources || [];

    if (!selectedSource) {
      this.store.dispatch(new ToastError('No selected source to toggle'));
      return;
    }

    const sourceID = selectedSource.id;
    const activeVal = state.isActive;

    this.appApi.setIsActive(sourceID, activeVal).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.store.dispatch(new ToastError('Your live review source could not be toggled'));
        return;
      } else if (res.status === 'SUCCESS') {

        this.store.dispatch(new ToastSuccess('Your live review source access has been toggled'));

        const updatedSources = sources.map((source) => {
          if (source.id === sourceID) {
            return { ...source, params: activeVal };
          }
          return source;
        });

        ctx.patchState({
          sources: updatedSources,
          selectedSource: { ...selectedSource, params: activeVal },
        });

      }
    });
    
  }

  @Action(UplaodCVSFile)
  uploadCVSFile(ctx: StateContext<AppStateModel>, state: UplaodCVSFile) {
    const selectedSource = ctx.getState().selectedSource;

    

    if (!selectedSource) return;

    selectedSource.isRefreshing = true;
      ctx.patchState({
        selectedSource,
      });

    const sourceID = selectedSource.id;
    const { file } = state;

    this.appApi.sendCSVFile(sourceID, file).subscribe((res) => {
      if (res.status === 'FAILURE') {
        this.store.dispatch(new ToastError('Your file could not be uploaded'));
        selectedSource.isRefreshing = false;
      ctx.patchState({
        selectedSource,
      });
        return;
      } else if (res.status === 'SUCCESS') {
        this.store.dispatch(new ToastSuccess('Your file has been uploaded'));
        this.store.dispatch(new GetSourceDashBoardInfo());
        selectedSource.isRefreshing = false;
        ctx.patchState({
          selectedSource,
        });
        }
    });
  }
  @Action(GenerateReport)
  generateReport(ctx: StateContext<AppStateModel>, state: GenerateReport) {
    const domainID = state.domainId;

    ctx.patchState({
      pdfLoading: true,
    });
  
    return this.appApi.generateReport(domainID).pipe(
      map((res) => {
        if (res.status === 'FAILURE') {
          this.store.dispatch(new ToastError('Your report could not be generated'));
          ctx.patchState({
            pdfLoading: false,
          });
          return of(res);
        } else if (res.status === 'SUCCESS') {
          this.store.dispatch(new ToastSuccess('Your report has been generated'));
          ctx.patchState({
            pdfUrl: res.url,
            pdfLoading: false,
          });
          return res.url;
        }
      }),
      catchError((error) => {
        // Handle error here and return an observable if needed
        return of(error);
      })
    );
  }


  static formatResponseSources(responseSources: any[]): DisplaySource[] {
    let displaySources: DisplaySource[] = [];

    for (let responseSource of responseSources) {
      let sourceUrl: any = '';
      if (responseSource.params.video_id) {
        sourceUrl = responseSource.params.video_id;
      } else if (responseSource.params.maps_url) {
        sourceUrl = responseSource.params.maps_url;
      } else if (responseSource.params.tripadvisor_url) {
        sourceUrl = responseSource.params.tripadvisor_url;
      } else if (responseSource.params.is_active){
        sourceUrl = responseSource.params.is_active;
      }

      console.log(responseSource);

      let displaySource: DisplaySource = {
        id: responseSource.source_id,
        name: responseSource.source_name,
        url: responseSource.source_icon,
        params: sourceUrl,
        selected: false,
        isRefreshing: false,
      };
      displaySources.push(displaySource);
    }
    console.log('returning display sources');
    console.log(displaySources);
    return displaySources;
  }

  static platformToIcon(platform: string): string {
    let source_image_name = '';
    switch (platform) {
      case 'trustpilot':
        source_image_name = 'trustpilot-logo.png';
        break;
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
        source_image_name = 'google-logo.png';
        break;
      case 'livereview':
        source_image_name = 'live-review-logo.png';
        break;
      case 'csv':
        source_image_name = 'csv-logo.png';
        break;
    }
    return source_image_name;
  }
}
