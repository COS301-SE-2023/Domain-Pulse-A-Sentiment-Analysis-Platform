import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { AttempPsswdLogin, Logout, RegisterUser, ToastSuccess } from '../app.actions';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.sass'],
})
export class RegisterPageComponent {
  isSpinning = false;
  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(private store: Store) {
    const wasGuest = localStorage.getItem('wasGuest');
    this.logoutIfSet(wasGuest);
  }

  logoutIfSet(wasGuest: string | null) {
    if(wasGuest != null) {
      localStorage.removeItem('wasGuest');
      this.store.dispatch(new Logout());
    }
  }

  register() {
    // validate password and confirmPasswrod
    this.isSpinning = true;
    this.store
      .dispatch(new RegisterUser(this.username, this.email, this.password))
      .subscribe({
        next: (res) => {
          /* this.store
            .dispatch(
              new AttempPsswdLogin(this.username, this.password)
            )
            .subscribe({
              next: (res) => {
                this.isSpinning = false;
              },
              error: (error) => {
                console.log(error);
                this.isSpinning = false;
              },
            }); */
            this.isSpinning = false;
        },
        error: (error) => {
          // console.log(error);
          this.isSpinning = false;
        },
      });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  getPasswordType() {
    return this.passwordVisible ? 'text' : 'password';

  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  getConfirmPasswordType() {
    return this.confirmPasswordVisible ? 'text' : 'password';
  }
}
