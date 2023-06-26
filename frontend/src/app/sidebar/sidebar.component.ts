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
import { AddNewDomain, SetDomain } from '../app.actions';

@Component({
  selector: 'dp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass'],
  animations: [
    trigger('smallLogoSwitch', [
      state(
        'in',
        style({
          opacity: 1,
          transform: 'scale(1)',
        })
      ),
      state(
        'out',
        style({
          opacity: 0,
          transform: 'scale(0.5)',
        })
      ),
      transition('in => out', animate('300ms ease-in')),
      transition('out => in', animate('300ms ease-out')),
    ]),
    trigger('fullLogoSwitch', [
      state(
        'in',
        style({
          opacity: 1,
          transform: 'scale(1)',
        })
      ),
      state(
        'out',
        style({
          opacity: 0,
          transform: 'scale(0.7)',
        })
      ),
      transition('in => out', [animate('400ms ease-in')]),
      transition('out => in', [animate('300ms ease-out')]),
    ]),
  ],
})
export class SidebarComponent {
  @Select(AppState.domains) domains$!: Observable<DisplayDomain[] | null>;
  smallLogoState = 'in';
  showSmallLogo = true;
  fullLogoState = 'out';
  showFullLogo = false;

  logoState = 'small';
  _expanded = false;
  @Input() set expanded(value: boolean) {
    if (value) {
      this.smallLogoState = 'out';
      this._expanded = true;
      setTimeout(() => {
        this.showSmallLogo = false;
        setTimeout(() => {
          this.showFullLogo = true;
          setTimeout(() => {
            this.fullLogoState = 'in';
          }, 50);
        }, 50);
      }, 300);
    } else {
      this.fullLogoState = 'out';
      this._expanded = false;
      setTimeout(() => {
        this.showSmallLogo = true;
        setTimeout(() => {
          this.showFullLogo = false;
          this.smallLogoState = 'in';
        }, 100);
      }, 300);
    }
  }

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
  showEditDomainModal = false;
  showProfileEditModal = false;

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

  toggleEditDomainModal(): void {
    if (!this.showEditDomainModal) {
      // this.windows[0].scrolling = false;
      this.showEditDomainModal = true;
    } else {
      // this.windows[0].scrolling = true;
      this.showEditDomainModal = false;
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

  toggleProfileEditModal(): void {
    if (!this.showProfileEditModal) {
      // this.windows[0].scrolling = false;
      this.showProfileEditModal = true;
    } else {
      // this.windows[0].scrolling = true;
      this.showProfileEditModal = false;
    }
  }

  addNewDomain(): void {
    console.log('addNewDomain');
    console.log(this.newDomainName, this.newDomainImageName);
    this.store.dispatch(
      new AddNewDomain(this.newDomainName, this.newDomainImageName)
    );
    this.toggleDomainModal();
  }

  selectDomain(domain: DisplayDomain) {
    this.store.dispatch(new SetDomain(domain));
  }

  theme = 0; //0 = light, 1 = dark

  toggleTheme() {
    console.log('toggle theme');
    if (this.theme == 0) {
      this.theme = 1;
      document.body.classList.toggle('light');
      document.body.classList.toggle('dark');
    } else {
      this.theme = 0;
      //document.body.style.setProperty('--background', '#e8ecfc');
      document.body.classList.toggle('light');
      document.body.classList.toggle('dark');
    }
  }


  imageSelected: boolean = false;
  selectedImage: File | undefined;

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
    this.imageSelected = true;
  }

  uploadImage() {
    // Handle image upload logic here
    // You can access the selected image using this.selectedImage
  }

  
}
