import { Component } from '@angular/core';
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
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
/* import { Demo2Setup, GetDomains, SetSourceIsLoading } from '../app.actions';
 */@Component({
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
export class MainComponent {
  @Select(AppState.selectedDomain)
  selectedDomain$!: Observable<DisplayDomain | null>;
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;
  @Select(AppState.userHasNoDomains) userHasNoDomains$!: Observable<boolean>;
  @Select(AppState.userHasNoSources) userHasNoSources$!: Observable<boolean>;
  userHasNoDomains = false;
  userHasNoSources = false;

  sidebarCollapsed = true;

  constructor() {
    this.userHasNoDomains$.subscribe((userHasNoDomains: boolean) => {
      this.userHasNoDomains = userHasNoDomains;
    });
    this.userHasNoSources$.subscribe((userHasNoSources: boolean) => {
      this.userHasNoSources = userHasNoSources;
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
