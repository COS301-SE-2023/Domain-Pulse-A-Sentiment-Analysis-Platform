import { Component, Input } from '@angular/core';
import { BackendService, Domain } from '../backend.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { Select, Store } from '@ngxs/store';
import { AppState, DisplayDomain } from '../app.state';
import { Observable } from 'rxjs';
import { SetDomain } from '../app.actions';

@Component({
  selector: 'dp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass'],
  animations: [
    trigger('logoSwitch', [
      state(
        'small',
        style({
          transform: 'scale(0.5)',
        })
      ),
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate(300),
      ]),
      transition(':leave', [
        animate(300, style({ transform: 'scale(0.5)' })),
        style({ opacity: 0 }),
      ]),
    ]),
  ],
})
export class SidebarComponent {
  @Select(AppState.domains) domains$!: Observable<DisplayDomain[] | null>;

  logoState = 'small';
  _expanded = false;
  @Input() set expanded(value: boolean) {
    // TODO have a seprate controller for the small logo and the large logo
    this._expanded = value;
  }

  // change logoState based on expanded
  // domains$ = this.backendService.domains$;

  domains = [
    {
      name: 'apple',
      imageUrl: '../assets/apple-1-logo-png-transparent.png',
      selected: false,
    },
    {
      name: 'Starbucks',
      imageUrl: '../assets/starbucks-logo-69391AB0A9-seeklogo.com.png',
      selected: true,
    },
    {
      name: 'Mcdonalds',
      imageUrl: '../assets/donalds-logo.png',
      selected: false,
    },
    {
      name: 'Formula 1',
      imageUrl: '../assets/f1-logo.png',
      selected: false,
    },
  ];

  newDomainName = '';
  newDomainImageName = '';

  showAddDomainModal = false;
  showProfileModal = false;

  constructor(private backendService: BackendService, private store: Store) {}

  toggleDomainModal(): void {
    if (!this.showAddDomainModal) {
      // this.windows[0].scrolling = false;
      this.showAddDomainModal = true;
    } else {
      // this.windows[0].scrolling = true;
      this.showAddDomainModal = false;
    }
  }

  toggleProfileModal(): void {
    if (!this.showProfileModal) {
      // this.windows[0].scrolling = false;
      this.showProfileModal = true;
    } else {
      // this.windows[0].scrolling = true;
      this.showProfileModal = false;
    }
  }

  addNewDomain(): void {
    console.log('addNewDomain');
    console.log(this.newDomainName, this.newDomainImageName);
    this.backendService.addNewDomain(
      this.newDomainName,
      this.newDomainImageName
    );
    this.toggleDomainModal();
  }

  selectDomain(domain: DisplayDomain) {
    this.store.dispatch(new SetDomain(domain));
  }

  theme = 0; //0 = light, 1 = dark

  toggleTheme(){
    console.log("toggle theme");
      if(this.theme == 0){
          this.theme = 1;
          document.body.classList.toggle('light');
          document.body.classList.toggle('dark');
      }else{
          this.theme = 0;
          //document.body.style.setProperty('--background', '#e8ecfc');
          document.body.classList.toggle('light');
          document.body.classList.toggle('dark');
      }
  }
}
