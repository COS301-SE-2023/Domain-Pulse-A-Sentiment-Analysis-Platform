import { DisplayDomain } from './app.state';

export class LoadUserDomains {
  static readonly type = '[App] Load User Domains';
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
  constructor(public domainName: string, domainImageName: string) {}
}

export class AddNewSource {
  static readonly type = '[App] Add New Source';
  constructor(public name: string, public platform: string) {}
}

export class CheckAuthenticate {
  static readonly type = '[App] Check Authenticate';
}
