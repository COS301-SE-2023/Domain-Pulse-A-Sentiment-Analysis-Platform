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
