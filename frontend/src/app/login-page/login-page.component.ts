import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { AttempGuestLogin, AttempPsswdLogin, Logout } from '../app.actions';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.sass'],
})
export class LoginPageComponent {
  showForgotPasswordModal = false;
  isSpinning = false;
  username = '';
  password = '';

  passwordVisible = false;

  constructor(private store: Store, private activatedRoute: ActivatedRoute) {
    // if the parameter u is present, check if it equals guest
    const u = this.activatedRoute.snapshot.queryParamMap.get('u');
    this.evaluateUser(u);

    const c = this.activatedRoute.snapshot.queryParamMap.get('c');
    this.logoutIfSet(c);
  }

  logoutIfSet(c: string | null) {
    if (c && c === 'clear') {
      this.store.dispatch(new Logout());
    }
  }

  evaluateUser(u: string | null) {
    if (u && u === 'guest') {
      this.store.dispatch(new AttempGuestLogin());
    }
  }

  login() {
    this.isSpinning = true;

    this.store
      .dispatch(new AttempPsswdLogin(this.username, this.password))
      .subscribe({
        next: (res) => {
          this.isSpinning = false;
        },
        error: (error) => {
          this.isSpinning = false;
        },
        complete: () => {
          this.isSpinning = false;
        },
      });
  }

  toggleForgotPasswordModal() {
    this.showForgotPasswordModal = !this.showForgotPasswordModal;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  getPasswordType() {
    return this.passwordVisible ? 'text' : 'password';
  }
}
