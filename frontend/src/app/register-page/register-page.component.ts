import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { RegisterUser } from '../app.actions';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.sass'],
})
export class RegisterPageComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor(private store: Store) {}

  register() {
    // validate password and confirmPasswrod

    this.store.dispatch(
      new RegisterUser(this.username, this.email, this.password)
    );
  }
}
