import { DisplayDomain, DisplaySource, Toast } from './app.state';

export class ToastError {
  static readonly type = '[App] Toast Error';
  constructor(public message: string, public timeout?: number) {}
}

export class ToastSuccess {
  static readonly type = '[App] Toast Success';
  constructor(public message: string, public timeout?: number) {}
}

export class Initialise {
  static readonly type = '[App] Initialise';
}

export class LoadUserDomains {
  static readonly type = '[App] Load User Domains';
}

/* export class GetProfileID {
  static readonly type = '[App] Get Profile ID';
} */

export class SetUserDetails {
  static readonly type = '[App] Set Profile Details';
  constructor(public profileId: number) {}
}

export class SetUser {
  static readonly type = '[App] Set User';
}

export class GetDomains {
  static readonly type = '[App] Get Domains';
}

export class SetDomain {
  static readonly type = '[App] Set Domain';
  constructor(public domain: DisplayDomain) {}
}

export class AddNewDomain {
  static readonly type = '[App] Add New Domain';
  constructor(
    public domainName: string,
    public domainImagUrl: string,
    public description: string
  ) {}
}

export class EditDomain {
  static readonly type = '[App] Edit Domain';
  constructor(
    public domainId: string,
    public domainName: string,
    public domainImageUrl: string,
    public description: string
  ) {}
}

export class DeleteDomain {
  static readonly type = '[App] Delete Domain';
  constructor(public domainID: string) {}
}

export class GetSources {
  static readonly type = '[App] Get Sources';
}

export class RefreshSourceData {
  static readonly type = '[App] Refresh Source Data';
  constructor(public sourceId?: string) {}
}

export class SetSource {
  static readonly type = '[App] Set Source';
  constructor(public source: DisplaySource | null) {}
}

export class SetAllSourcesSelected{
  static readonly type = '[App] Set All Sources Selected';
  constructor(public selected: boolean) {}
}

export class AddNewSource {
  static readonly type = '[App] Add New Source';
  constructor(
    public name: string,
    public platform: string,
    public params: any,
  ) {}
}

export class EditSource {
  static readonly type = '[App] Edit Source';
  constructor(
    public name: string,
  ) {}
}

export class DeleteSource {
  static readonly type = '[App] Delete Source';
  constructor() {}
}

export class CheckAuthenticate {
  static readonly type = '[App] Check Authenticate';
}

export class GetSourceDashBoardInfo {
  static readonly type = '[App] Get Source DashBoard Info';
}

export class AttempPsswdLogin {
  static readonly type = '[Auth] Attemp Login';
  constructor(public username: string, public password: string) {}
}

export class DeleteUser {
  static readonly type = '[Auth] Delete User';
  constructor(public username: string, public password: string) {}
}

export class RegisterUser {
  static readonly type = '[Auth] Register User';
  constructor(
    public username: string,
    public password: string,
    public email: string
  ) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
  constructor() {}
}

export class ChangePassword {
  static readonly type = '[Auth] Change Password';
  constructor(public oldPassword: string, public newPassword: string) {}
}

export class ChangeMode {
  static readonly type = '[App] Change Mode';
  constructor() {}
}

export class ChooseStatistic {
  static readonly type = '[App] Choose Statistic';
  constructor(public statisticIndex: number) {}
}

export class SetSourceIsLoading {
  static readonly type = '[Source] Set Loading';
  constructor(public isLoading: boolean) {}
}

export class ChangeProfileIcon{
  static readonly type = '[Profile] Change Icon';
  constructor(public profileIcon: string) {}
}

export class SetIsActive{
  static readonly type = '[Profile] Set Is Active';
  constructor(public isActive: boolean) {}
}

export class UplaodCVSFile{
  static readonly type = '[Source] Upload CVS File';
  constructor(public file: any) {}
}
export class GenerateReport{
  static readonly type = '[Source] Generate Report';
  constructor(public domainId: string) {}
}

export class ToggleAddDomainModal {
  static readonly type = '[App] Toggle Add Domain Modal';
}

export class ToggleProfileModal {
  static readonly type = '[App] Toggle Profile Modal';
}

export class ToggleEditDomainModal{
  static readonly type = '[App] Toggle Edit Domain Modal';

}

export class ToggleConfirmDeleteDomainModal{
  static readonly type = '[App] Toggle Confirm Delete Domain Modal';
}
