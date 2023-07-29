import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { Select, Store } from '@ngxs/store';
import {
  AppState,
  DisplayDomain,
  ProfileDetails,
  UserDetails,
} from '../app.state';
import { AzureBlobStorageService } from '../azure-blob-storage.service';
import { Observable, catchError, of } from 'rxjs';
import {
  AddNewDomain,
  DeleteDomain,
  DeleteUser,
  EditDomain,
  SetDomain,
  SetUserDetails,
  SetSourceIsLoading,
  ChangePassword,
  ChangeMode,
  ChangeProfileIcon,
  ToastError,
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
export class SidebarComponent {
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

  newDomainName = '';
  newDomainImageName = '';
  newDomainDescription = '';

  editDomainName = '';
  editDomainImageName = '';
  editDomainDescription = '';


  oldPassword = '';
  newPassword = '';

  password= '';

  deleteDomainId = '';

  showAddDomainModal = false;
  showProfileModal = false;
  showEditDomainModal = false;
  showProfileEditModal = false;
  showChangePasswordModal = false;
  showDeleteAccountModal = false;
  showConfirmDeleteAccountModal = false;
  showConfirmDeleteDomainModal = false;

  baseUrl= 'https://domainpulseblob.blob.core.windows.net/blob/';
  domainNames: string[] = [this.baseUrl+'defaultDomain1.png', this.baseUrl+'defaultDomain2.png', this.baseUrl+'defaultDomain3.png', this.baseUrl+'defaultDomain4.png', this.baseUrl+'defaultDomain5.png', this.baseUrl+'defaultDomain6.png', this.baseUrl+'defaultDomain7.png', this.baseUrl+'defaultDomain8.png', this.baseUrl+'defaultDomain9.png', this.baseUrl+'defaultDomain10.png'];


  private selectedFile: File | null = null;
  private selectedFileDomain: File | null = null;
  private selectedFileDomainEdit: File | null = null;

  constructor(
    private store: Store,
    private blobStorageService: AzureBlobStorageService
  ) {}

  toggleDomainModal(): void {
    if (!this.showAddDomainModal) {
      this.showAddDomainModal = true;
    } else {
      this.showAddDomainModal = false;
    }
  }

  toggleEditDomainModal(): void {
    if (!this.showEditDomainModal) {
      const selectedDomain = this.store.selectSnapshot(AppState.selectedDomain);
      if (!selectedDomain) return;
      this.editDomainName = selectedDomain.name;
      this.editDomainImageName = selectedDomain.imageUrl;
      this.editDomainDescription = selectedDomain.description;
      this.selectIconEdit(selectedDomain.imageUrl);
      this.showEditDomainModal = true;
    } else {
      this.showEditDomainModal = false;
    }
  }

  toggleProfileModal(): void {
    if (!this.showProfileModal) {
      this.showProfileModal = true;
    } else {
      this.showProfileModal = false;
    }
  }

  toggleProfileEditModal(): void {
    if (!this.showProfileEditModal) {
      this.showProfileEditModal = true;
    } else {
      this.showProfileEditModal = false;
    }
  }

  toggleChangePasswordModal(): void {
    if (!this.showChangePasswordModal) {
      this.showChangePasswordModal = true;
    } else {
      this.showChangePasswordModal = false;
    }
  }

  toggleDeleteAccountModal(): void {
    if (!this.showDeleteAccountModal) {
      this.showDeleteAccountModal = true;
    } else {
      this.showDeleteAccountModal = false;
      this.toggleConfirmDeleteAccountModal();
    }
  }

  toggleConfirmDeleteAccountModal(): void {
    if (!this.showConfirmDeleteAccountModal) {
      this.showConfirmDeleteAccountModal = true;
    } else {
      this.showConfirmDeleteAccountModal = false;
    }
  }

  toggleConfirmDeleteDomainModal(id?: string): void {
    if(id){
      this.deleteDomainId = id;
    }
    if (!this.showConfirmDeleteDomainModal) {      
      this.showConfirmDeleteDomainModal = true;
    } else {
      
      this.showConfirmDeleteDomainModal = false;
    }
  }

  /* closeAllModals(): void {
    this.showAddDomainModal = false;
    this.showProfileModal = false;
    this.showEditDomainModal = false;
    this.showProfileEditModal = false;
    this.showChangePasswordModal = false;
    this.showDeleteAccountModal = false;
    this.showConfirmDeleteAccountModal = false;
  }
 */
  addNewDomain(): void {
    this.addDomainSpinner = true;
    let valid = true;

    if (!this.selectedFileDomain && !this.newDomainImageName) {
      this.addDomainSpinner = false;
      this.store.dispatch(new ToastError('Please select a domain icon'));
      valid = false;
    }

    if(!this.newDomainName){
      this.addDomainSpinner = false;
      this.store.dispatch(new ToastError('Please enter a domain name'));
      valid = false;
    }

    if(!this.newDomainDescription){
      this.addDomainSpinner = false;
      this.store.dispatch(new ToastError('Please enter a domain description'));
      valid = false;
    }

    if(!valid){
      return;
    }

    if(this.selectedFileDomain){
      const filenameDomain = this.uploadImageDomain();
      this.newDomainImageName = this.baseUrl + filenameDomain;
    }

    this.store.dispatch(
      new AddNewDomain(
        this.newDomainName,
        this.newDomainImageName,
        this.newDomainDescription
      )
    ).pipe(
      catchError((error) => {
        this.addDomainSpinner = false;
        return of();
      })
    ).subscribe((result) => {
      this.addDomainSpinner = false;
      this.toggleDomainModal();
    });
    this.newDomainName = '';
    this.newDomainImageName = '';
    this.newDomainDescription = '';

    
  }

  selectIcon(icon: string) {
    console.log("domain icon:" + icon)
    this.newDomainImageName = icon;
  }

  selectIconEdit(icon: string) {
    console.log("domain icon:" + icon)
    this.editDomainImageName = icon;
  }

  editDomain() {
    const selectedDomain = this.store.selectSnapshot(AppState.selectedDomain);
    if (!selectedDomain) return;
    const selectedDomainId = selectedDomain.id;

    this.store.dispatch(
      new EditDomain(
        selectedDomainId,
        this.editDomainName,
        this.editDomainImageName,
        this.editDomainDescription
      )
    );
    this.editDomainName = '';
    this.editDomainImageName = '';
    this.editDomainDescription = '';

    this.toggleEditDomainModal();
  }

  deleteDomain() {
    this.store.dispatch(new DeleteDomain(this.deleteDomainId));
    this.toggleConfirmDeleteDomainModal();
  }

  selectDomain(domain: DisplayDomain) {
    this.store.dispatch(new SetSourceIsLoading(true));
    this.store.dispatch(new SetDomain(domain));
  }

  toggleTheme() {
    this.store.dispatch(new ChangeMode());
    document.body.classList.toggle('light');
    document.body.classList.toggle('dark');
    /* if(document.body.classList.contains('light')){
      localStorage.setItem('theme', 'dark');
    }else{
      localStorage.setItem('theme', 'light');
    } */
  }

  imagePreview: string | ArrayBuffer | null = null;

  onImageSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedFile = inputElement.files?.item(0) as File | null;

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.imagePreview = null;
    }
  }

  uploadSpinner: boolean = false;

  async uploadImage() {
    this.uploadSpinner = true;
    if (!this.selectedFile) {
      this.uploadSpinner = false;
      this.store.dispatch(new ToastError('Please select an image'));
      return;
    }
    const userDetails = this.store.selectSnapshot(AppState.userDetails);
    if (!userDetails) {
      this.uploadSpinner = false;
      return;
    }

    /* const fileName = this.selectedFile.name; */
    const filename = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    this.blobStorageService.uploadImage(
      environment.SAS,
      this.selectedFile,
      filename,
      () => {
        console.log('Image uploaded successfully.');
      }
    );

    this.store
      .dispatch(
        new ChangeProfileIcon(
          'https://domainpulseblob.blob.core.windows.net/blob/' + filename
        )
      )
      .subscribe({
        next: (res) => {
          this.uploadSpinner = false;
          this.selectedFile = null;
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagePreview = null;
          };
        },
        error: (error) => {
          this.uploadSpinner = false;
        },
      });
  }

  imagePreviewDomain: string | ArrayBuffer | null = null;

  onImageSelectedDomain(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedFileDomain = inputElement.files?.item(0) as File | null;

    if (this.selectedFileDomain) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewDomain = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFileDomain);
    } else {
      this.imagePreviewDomain = null;
    }
  }

  addDomainSpinner: boolean = false;

  uploadImageDomain() {
    
    if (!this.selectedFileDomain) {
      this.addDomainSpinner = false;
      this.store.dispatch(new ToastError('Please select an image'));
      return;
    }

    
    const filename = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    this.blobStorageService.uploadImage(
      environment.SAS,
      this.selectedFileDomain,
      filename,
      () => {
        console.log('Image uploaded successfully.');
      }
    );

    return filename;
  }

  imagePreviewDomainEdit: string | ArrayBuffer | null = null;

  onImageSelectedDomainEdit(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.selectedFileDomainEdit = inputElement.files?.item(0) as File | null;

    if (this.selectedFileDomainEdit) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewDomainEdit = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFileDomainEdit);
    } else {
      this.imagePreviewDomainEdit = null;
    }
  }

  editDomainSpinner: boolean = false;

  uploadImageDomainEdit() {
    
    if (!this.selectedFileDomainEdit) {
      this.editDomainSpinner = false;
      this.store.dispatch(new ToastError('Please select an image'));
      return;
    }

    
    const filename = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    this.blobStorageService.uploadImage(
      environment.SAS,
      this.selectedFileDomainEdit,
      filename,
      () => {
        console.log('Image uploaded successfully.');
      }
    );

    return filename;
  }

  changePassword() {
    this.store.dispatch(new ChangePassword(this.oldPassword, this.newPassword));
    this.oldPassword = '';
    this.newPassword = '';
    this.toggleChangePasswordModal();
  }

  deleteAccount(){
    const userDetails = this.store.selectSnapshot(AppState.userDetails);
    const username = userDetails?.username;

    console.log(username);
    console.log(this.password)

    if(!username) return;

    this.store.dispatch(new DeleteUser(username, this.password ));
    /* this.closeAllModals(); */
    
  }
}
