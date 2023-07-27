import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { Select, Store } from '@ngxs/store';
import { AppState, DisplayDomain, ProfileDetails } from '../app.state';
import { Observable } from 'rxjs';
import {
  AddNewDomain,
  DeleteDomain,
  EditDomain,
  SetDomain,
  SetProfileDetails,
  SetSourceIsLoading,
  ChangePassword,
} from '../app.actions';

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

  @Output() sidebarClicked: EventEmitter<void> = new EventEmitter<void>();

  clickSidebar() {
    this.sidebarClicked.emit();
  }

  @Select(AppState.domains) domains$!: Observable<DisplayDomain[] | null>;
  @Select(AppState.profileDetails)
  profileDetails$!: Observable<ProfileDetails | null>;
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;

  smallLogoState = 'in';
  showSmallLogo = true;
  fullLogoState = 'out';
  showFullLogo = false;

  logoState = 'small';
  _expanded = false;
  @Input() set expanded(value: boolean) {
    console.log('lets be serious');

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
  newDomainDescription = '';

  oldPassword=''
  newPassword=''

  showAddDomainModal = false;
  showProfileModal = false;
  showEditDomainModal = false;
  showProfileEditModal = false;
  showChangePasswordModal = false;

  constructor(private store: Store) {}

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

  toggleChangePasswordModal(): void {
    if (!this.showChangePasswordModal) {
      // this.windows[0].scrolling = false;
      this.showChangePasswordModal = true;
    } else {
      // this.windows[0].scrolling = true;
      this.showChangePasswordModal = false;
    }
  }

  addNewDomain(): void {
    this.store.dispatch(
      new AddNewDomain(
        this.newDomainName,
        this.newDomainImageName,
        this.newDomainDescription
      )
    );
    this.newDomainName = '';
    this.newDomainImageName = '';
    this.newDomainDescription = '';

    this.toggleDomainModal();
  }

  editDomain() {
    const selectedDomain = this.store.selectSnapshot(AppState.selectedDomain);
    if (!selectedDomain) return;
    const selectedDomainId = selectedDomain.id;

    this.store.dispatch(
      new EditDomain(
        selectedDomainId,
        this.newDomainName,
        this.newDomainImageName,
        this.newDomainDescription
      )
    );
    this.newDomainName = '';
    this.newDomainImageName = '';
    this.newDomainDescription = '';

    this.toggleEditDomainModal();
  }

  deleteDomain(domainToDeleteId: number) {
    this.store.dispatch(new DeleteDomain(domainToDeleteId));
  }

  selectDomain(domain: DisplayDomain) {
    this.store.dispatch(new SetSourceIsLoading(true));
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

  changePassword(){
    this.store.dispatch(new ChangePassword(this.oldPassword, this.newPassword))
    this.oldPassword=''
    this.newPassword=''
    this.toggleChangePasswordModal()
  }
}
