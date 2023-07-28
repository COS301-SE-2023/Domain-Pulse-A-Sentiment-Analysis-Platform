import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { AttempPsswdLogin } from '../app.actions';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.sass'],
})
export class LoginPageComponent {
  isSpinning = false;
  username = '';
  password = '';

  constructor(private store: Store) {}

  login() {
    this.isSpinning = true;
  
    this.store.dispatch(new AttempPsswdLogin(this.username, this.password))
      .subscribe({
        next: (res) => {
          this.isSpinning = false;
        },
        error: (error) => {
          this.isSpinning = false;
        },
        complete: () => {
          this.isSpinning = false;
        }
      });
  }
}
