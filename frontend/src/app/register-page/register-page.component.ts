import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { AttempPsswdLogin, RegisterUser } from '../app.actions';

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

  constructor(private store: Store) {}

  register() {
    // validate password and confirmPasswrod
    this.isSpinning = true;
    this.store
      .dispatch(new RegisterUser(this.username, this.email, this.password))
      .subscribe({
        next: (res) => {
          this.store
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
            });
        },
        error: (error) => {
          console.log(error);
          this.isSpinning = false;
        },
      });
  }
}
