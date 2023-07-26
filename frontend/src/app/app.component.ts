import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Initialise } from './app.actions';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  constructor(private store: Store) {}
  ngOnInit(): void {
    this.store.dispatch(new Initialise());
  }
}
