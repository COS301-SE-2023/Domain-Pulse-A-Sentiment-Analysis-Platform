import { DisplayDomain, DisplaySource } from './app.state';

export class Demo2Setup {
  static readonly type = '[App] Demo2 Setup';
}

export class LoadUserDomains {
  static readonly type = '[App] Load User Domains';
}

export class SetProfileId {
  static readonly type = '[App] Set Profile Id';
  constructor(public profileId: number) { }
}

/* export class GetProfileID {
  static readonly type = '[App] Get Profile ID';
} */

export class SetProfileDetails {
  static readonly type = '[App] Set Profile Details';
  constructor(
      public profileId: number
    ) { }
}

export class SetUser {
  static readonly type = '[App] Set User';
}

export class GetDomains {
  static readonly type = '[App] Get Domains';
}

export class SetDomain {
  static readonly type = '[App] Set Domain';
  constructor(public domain: DisplayDomain) { }
}

export class AddNewDomain {
  static readonly type = '[App] Add New Domain';
  constructor(
    public domainName: string,
    public domainImagUrl: string,
    public description: string
  ) { }
}

export class EditDomain {
  static readonly type = '[App] Edit Domain';
  constructor(
    public domainId: number,
    public domainName: string,
    public domainImagUrl: string,
    public description: string
  ) { }
}

export class DeleteDomain {
  static readonly type = '[App] Delete Domain';
  constructor(public domainID: number) { }
}

export class GetSources {
  static readonly type = '[App] Get Sources';
}

export class SetSource {
  static readonly type = '[App] Set Source';
  constructor(public source: DisplaySource) { }
}

export class AddNewSource {
  static readonly type = '[App] Add New Source';
  constructor(public name: string, public platform: string, public params: any) {}
}

export class CheckAuthenticate {
  static readonly type = '[App] Check Authenticate';
}

export class GetSourceDashBoardInfo {
  static readonly type = '[App] Get Source DashBoard Info';
}

export class AttempPsswdLogin {
  static readonly type = '[Auth] Attemp Login';
  constructor(public username: string, public password: string) { }
}

export class RegisterUser {
  static readonly type = '[Auth] Register User';
  constructor(
    public username: string,
    public password: string,
    public email: string
  ) { }
}

export class ChooseStatistic {
  static readonly type = '[App] Choose Statistic';
  constructor(public statisticIndex: number) { }
}
