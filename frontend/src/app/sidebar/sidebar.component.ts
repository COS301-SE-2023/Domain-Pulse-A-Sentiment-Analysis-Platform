import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { Select, Store } from '@ngxs/store';
import { AppState, DisplayDomain, ProfileDetails, UserDetails } from '../app.state';
import { AzureBlobStorageService } from '../azure-blob-storage.service';
import { Observable } from 'rxjs';
import {
  AddNewDomain,
  DeleteDomain,
  EditDomain,
  SetDomain,
  SetUserDetails,
  SetSourceIsLoading,
  ChangePassword,
  ChangeMode,
  ChangeProfileIcon,
} from '../app.actions';
import { environment } from '../../environment';


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
export class SidebarComponent{

  @Output() sidebarClicked: EventEmitter<void> = new EventEmitter<void>();

  clickSidebar() {
    this.sidebarClicked.emit();
  }

  @Select(AppState.domains) domains$!: Observable<DisplayDomain[] | null>;
  @Select(AppState.userDetails)
  userDetails$!: Observable<UserDetails | null>;
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

  private selectedFile: File | null = null;

  constructor(private store: Store, private blobStorageService: AzureBlobStorageService) {}
  
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

  deleteDomain(domainToDeleteId: string) {
    this.store.dispatch(new DeleteDomain(domainToDeleteId));
  }

  selectDomain(domain: DisplayDomain) {
    this.store.dispatch(new SetSourceIsLoading(true));
    this.store.dispatch(new SetDomain(domain));
  }

  

  toggleTheme() {
    this.store.dispatch(new ChangeMode())
    document.body.classList.toggle('light');
    document.body.classList.toggle('dark');
    /* if(document.body.classList.contains('light')){
      localStorage.setItem('theme', 'dark');
    }else{
      localStorage.setItem('theme', 'light');
    } */

  }

  imageSelected: boolean = false;

  onImageSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedFile = inputElement.files?.item(0) as File | null;
  }


  uploadSpinner: boolean = false;

  async uploadImage() {
    this.uploadSpinner = true;
    if (!this.selectedFile) {
      this.uploadSpinner = false;
      return;
    }
    const userDetails = this.store.selectSnapshot(AppState.userDetails);
    if(!userDetails){
      this.uploadSpinner = false;
      return;
    }
    
    /* const fileName = this.selectedFile.name; */
    const filename = Math.floor(Math.random() * 100000000).toString().padStart(8, '0'); ;
    this.blobStorageService.uploadImage(environment.SAS, this.selectedFile, filename, () => {
      console.log('Image uploaded successfully.')
    })

    this.store
      .dispatch(new ChangeProfileIcon('https://domainpulseblob.blob.core.windows.net/blob/' + filename ))
      .subscribe({
        next: (res) => {
          this.uploadSpinner = false;
          
        },
        error: (error) => {
          
          this.uploadSpinner = false;
        },
      });
    

  }

  changePassword(){
    this.store.dispatch(new ChangePassword(this.oldPassword, this.newPassword))
    this.oldPassword=''
    this.newPassword=''
    this.toggleChangePasswordModal()
  }
}
