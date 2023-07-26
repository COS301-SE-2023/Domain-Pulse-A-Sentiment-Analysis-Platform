import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group,
  animateChild,
  query,
} from '@angular/animations';
import { AppState, DisplayDomain } from '../app.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Demo2Setup, GetDomains, SetSourceIsLoading } from '../app.actions';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  animations: [
    trigger('collapsed', [
      state(
        'collapsed',
        style({
          width: '5%',
        })
      ),
      state(
        'notCollapsed',
        style({
          width: '20%',
        })
      ),
      transition(
        'collapsed <=> notCollapsed',
        group([
          query('@smallLogoSwitch', [animateChild()], { optional: true }),
          query('@fullLogoSwitch', [animateChild()], { optional: true }),
          animate('0.3s ease-in-out'),
        ])
      ),
    ]),
  ],
})
export class MainComponent implements OnInit {
  @Select(AppState.selectedDomain)
  selectedDomain$!: Observable<DisplayDomain | null>;
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;

  sidebarCollapsed = true;

  constructor(private store: Store) {
    // this.store.dispatch(new Demo2Setup());
    // this.store.dispatch(new GetDomains());
  }

  ngOnInit(): void {
    this.store.dispatch(new SetSourceIsLoading(true));
    this.store.dispatch(new GetDomains());

  }

  

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  
}
