import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Initialise } from './app.actions';
import { AppState, ProfileDetails } from './app.state';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  @Select(AppState.profileDetails) profileDetails$!: Observable<ProfileDetails>;

  private theme: boolean | undefined; 

  constructor(private store: Store) {}
  
  ngOnInit(): void {
    this.store.dispatch(new Initialise());
    this.profileDetails$.subscribe((profileDetails) => {
      const mode = profileDetails.mode;
      this.theme = mode;
      console.log("mode is:" + mode);
      document.body.classList.toggle('light', mode);
      document.body.classList.toggle('dark', !mode);
    });
  }
}
