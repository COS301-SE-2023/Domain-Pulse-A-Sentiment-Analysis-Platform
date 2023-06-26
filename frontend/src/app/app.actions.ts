import { DisplayDomain, DisplaySource } from './app.state';

export class LoadUserDomains {
  static readonly type = '[App] Load User Domains';
}

export class SetProfileId {
  static readonly type = '[App] Set Profile Id';
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

export class GetSources {
  static readonly type = '[App] Get Sources';
}

export class SetSource {
  static readonly type = '[App] Set Source';
  constructor(public source: DisplaySource) {}
}

export class AddNewSource {
  static readonly type = '[App] Add New Source';
  constructor(public name: string, public platform: string) {}
}

export class CheckAuthenticate {
  static readonly type = '[App] Check Authenticate';
}

export class GetDashboardData {
  static readonly type = '[App] Get Dashboard Data';
}

export class AttempPsswdLogin {
  static readonly type = '[Auth] Attemp Login';
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