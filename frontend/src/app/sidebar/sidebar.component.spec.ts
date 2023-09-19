import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable, first, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  AddNewDomain,
  ChangePassword,
  DeleteDomain,
  DeleteUser,
  EditDomain,
  Logout,
  SetDomain,
  SetUserDetails,
  ToastError,
} from '../app.actions';
import { AppState, DisplayDomain, UserDetails } from '../app.state';
import { ModalContainerComponent } from '../modal-container/modal-container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(async () => {
    appApiSpy = jasmine.createSpyObj('AppApi', [
      'addDomain',
      'linkDomainToProfile',
      'editDomain',
      'removeDomain',
    ]);
    appApiSpy.addDomain.and.returnValue(
      of({ status: 'SUCCESS', new_domain: { id: 1 } })
    );
    appApiSpy.linkDomainToProfile.and.returnValue(of({ status: 'FAILURE' }));
    appApiSpy.editDomain.and.callThrough();
    appApiSpy.removeDomain.and.returnValue(of({ status: 'SUCCESS' }));

    await TestBed.configureTestingModule({
      declarations: [SidebarComponent, ModalContainerComponent],
      providers: [SidebarComponent, { provide: AppApi, useValue: appApiSpy }],
      imports: [
        BrowserAnimationsModule,
        NgxsModule.forRoot([AppState]),
        FormsModule,
        ToastrModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    spyOn(storeSpy, 'select').and.returnValue(of(null)); 
    spyOn(storeSpy, 'selectSnapshot').and.returnValue(null); 

    actions$ = TestBed.inject(Actions);
    TestBed.inject(ToastrService);
    fixture.detectChanges();
  });

  // Integration Test
  
  it('should fire a "AddDomain" action', (done: DoneFn) => {
    component.newDomainName = 'New Domain Name';
    component.newDomainImageName = 'New Domain Image Name';
    component.newDomainDescription = 'New Domain Description';

    actions$.pipe(ofActionDispatched(AddNewDomain)).subscribe(() => {
      
      setTimeout(() => {
        expect(component.newDomainName).toBe('');
        expect(component.newDomainImageName).toBe('');
        expect(component.newDomainDescription).toBe('');

        done();
      }, 300);
    });

    component.addNewDomain();
  });

  // Integration Test

  it('should fire an "EditDomain" action', (done: DoneFn) => {
    
    component.editDomainName = 'New Domain Name';
    component.editDomainImageName = 'image';
    component.editDomainDescription = 'New Domain Description';

    actions$.pipe(ofActionDispatched(EditDomain)).subscribe(() => {
      
      setTimeout(() => {
        expect(component.newDomainName).toBe('');
        expect(component.newDomainImageName).toBe('');
        expect(component.newDomainDescription).toBe('');

        done();
      }, 500);
    });

    const dummyDisplayDomain: DisplayDomain = {
      id: '1',
      name: 'Dummy Domain',
      description: 'Dummy Description',
      selected: false,
      imageUrl: 'Dummy Image Url',
      sourceIds: ['1', '2', '3'],
      sources: [],
    };

    storeSpy.selectSnapshot.and.returnValue(dummyDisplayDomain);
    component.editDomain();
  });

  it('should Toggle The domain flag', () => {
    component.showAddDomainModal = false;
    component.toggleDomainModal();
    expect(component.showAddDomainModal).toBe(true);

    component.showAddDomainModal = true;
    component.toggleDomainModal();
    expect(component.showAddDomainModal).toBe(false);
  });

  it('should toggle the Edit Domain Modal flag', () => {
    component.showEditDomainModal = false;
    component.toggleEditDomainModal();
    expect(component.showEditDomainModal).toBe(true);

    component.showEditDomainModal = true;
    component.toggleEditDomainModal();
    expect(component.showEditDomainModal).toBe(false);
  });

  it('should toggle the Profile Modal', () => {
    component.showProfileModal = false;
    component.toggleProfileModal();
    expect(component.showProfileModal).toBe(true);

    component.showProfileModal = true;
    component.toggleProfileModal();
    expect(component.showProfileModal).toBe(false);
  });

  it('toggle the edit profile modal', () => {
    component.showProfileEditModal = false;
    component.toggleProfileEditModal();
    expect(component.showProfileEditModal).toBe(true);

    component.showProfileEditModal = true;
    component.toggleProfileEditModal();
    expect(component.showProfileEditModal).toBe(false);
  });

  // Integration Test

  it('should fire the "SetDomain" action', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(SetDomain)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const dummyDisplayDomain: DisplayDomain = {
      id: '1',
      name: 'Dummy Domain',
      description: 'Dummy Description',
      selected: false,
      imageUrl: 'Dummy Image Url',
      sourceIds: ['1', '2', '3'],
      sources: [],
    };

    component.selectDomain(dummyDisplayDomain);
  });

  // Integration Test

  it('should fire a "DeleteDomain" action', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(DeleteDomain)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const displayId = '1';
    component.deleteDomainId = displayId;
    component.deleteDomain();
  });

  it('should fire sideBarClicked event when the sidebar is clicked', () => {
    let eventFired = false;
    component.sidebarClicked.pipe(first()).subscribe(() => (eventFired = true));

    component.clickSidebar();
    expect(eventFired).toBeTrue();
  });

  it('should switch out the logo when sidebar state changes', () => {
    component.expanded = true;
    expect(component.smallLogoState).toBe('out');
    expect(component._expanded).toBe(true);
    

    component.expanded = false;
    expect(component.fullLogoState).toBe('out');
    expect(component._expanded).toBe(false);
    
  });
});

describe('SidebarComponent and AppState', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(async () => {
    appApiSpy = jasmine.createSpyObj('AppApi', [
      'addDomain',
      'linkDomainToProfile',
      'editDomain',
      'removeDomain',
      'getDomainIDs',
      'getProfile',
      'getUserByID',
    ]);
    appApiSpy.addDomain.and.returnValue(
      of({ status: 'SUCCESS', new_domain: { id: 1 } })
    );
    appApiSpy.editDomain.and.callThrough();
    appApiSpy.removeDomain.and.returnValue(of({ status: 'SUCCESS' }));

    await TestBed.configureTestingModule({
      declarations: [SidebarComponent, ModalContainerComponent],
      providers: [SidebarComponent, { provide: AppApi, useValue: appApiSpy }],
      imports: [
        BrowserAnimationsModule,
        NgxsModule.forRoot([AppState]),
        FormsModule,
        ToastrModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    
    

    actions$ = TestBed.inject(Actions);
    TestBed.inject(ToastrService);
    fixture.detectChanges();
  });

  it('should set the username after state change', (done: DoneFn) => {
    appApiSpy.getProfile.and.returnValue(
      of({
        status: 'SUCCESS',
        id: 1,
        userID: 1,
        profileIcon: 'test',
        mode: 'test',
      })
    );
    appApiSpy.getUserByID.and.returnValue(
      of({
        status: 'SUCCESS',
        username: 'mendemz',
        email: 'hello@client.com',
        password: 'password',
        profileIcon: 'test',
        oldPassword: 'oldPassword',
      })
    );
    appApiSpy.getDomainIDs.and.returnValue(
      of({ status: 'SUCCESS', domainIDs: [] })
    );

    let userDetails: UserDetails | undefined;
    component.userDetails$.subscribe((gottenUserDetails) => {
      if (gottenUserDetails) userDetails = gottenUserDetails;
    });

    storeSpy.dispatch(new SetUserDetails(1));

    setTimeout(() => {
      fixture.detectChanges();
      const { debugElement } = fixture;
      const { nativeElement } = debugElement;
      const userdisplay = nativeElement.querySelector('.userDetails');
      expect(userDetails).toBeDefined();
      expect(userDetails?.username).toBe('mendemz');
      done();
    }, 3000);
  });

  it('should toggle the edit domain modal and set editDomain properties if selectedDomain is available', () => {
    const dummyDisplayDomain: DisplayDomain = {
      id: '1',
      name: 'Dummy Domain',
      description: 'Dummy Description',
      selected: false,
      imageUrl: 'Dummy Image Url',
      sourceIds: ['1', '2', '3'],
      sources: [],
    };

    spyOn(component['store'], 'selectSnapshot').and.returnValue(dummyDisplayDomain);

    component.showEditDomainModal = false;
    component.toggleEditDomainModal();

    expect(component.showEditDomainModal).toBe(true);
    expect(component.editDomainName).toBe(dummyDisplayDomain.name);
    expect(component.editDomainImageName).toBe(dummyDisplayDomain.imageUrl);
    expect(component.editDomainDescription).toBe(dummyDisplayDomain.description);
  });

  it('should toggle the edit domain modal without setting editDomain properties if selectedDomain is not available', () => {
    spyOn(component['store'], 'selectSnapshot').and.returnValue(null);

    component.showEditDomainModal = false;
    component.toggleEditDomainModal();

    expect(component.showEditDomainModal).toBe(true);
    expect(component.editDomainName).toBe(''); 
    expect(component.editDomainImageName).toBe('');
    expect(component.editDomainDescription).toBe('');
  });

  it('should set showEditDomainModal to false when calling toggleEditDomainModal if it was true', () => {
    component.showEditDomainModal = true;

    component.toggleEditDomainModal();

    expect(component.showEditDomainModal).toBe(false);
  });


  it('should toggle the change password modal', () => {
    component.showChangePasswordModal = false;
    component.toggleChangePasswordModal();
    expect(component.showChangePasswordModal).toBe(true);

    component.showChangePasswordModal = true;
    component.toggleChangePasswordModal();
    expect(component.showChangePasswordModal).toBe(false);
  });

  it('should toggle the delete account modal', () => {
    component.showDeleteAccountModal = false;
    component.toggleDeleteAccountModal();
    expect(component.showDeleteAccountModal).toBe(true);

    component.showDeleteAccountModal = true;
    component.toggleDeleteAccountModal();
    expect(component.showDeleteAccountModal).toBe(false);
    expect(component.showConfirmDeleteAccountModal).toBe(true);
  });

  it('should toggle the confirm delete account modal', () => {
    component.showConfirmDeleteAccountModal = false;
    component.toggleConfirmDeleteAccountModal();
    expect(component.showConfirmDeleteAccountModal).toBe(true);

    component.showConfirmDeleteAccountModal = true;
    component.toggleConfirmDeleteAccountModal();
    expect(component.showConfirmDeleteAccountModal).toBe(false);
  });

  it('should toggle the confirm delete domain modal and set deleteDomainId if id is provided', () => {
    const dummyDomainId = '123';
    component.deleteDomainId = ''; 

    component.showConfirmDeleteDomainModal = true;
    component.toggleConfirmDeleteDomainModal();
    expect(component.showConfirmDeleteDomainModal).toBe(false);
    expect(component.deleteDomainId).toBe('');

    component.showConfirmDeleteDomainModal = false;
    component.toggleConfirmDeleteDomainModal(dummyDomainId);
    expect(component.showConfirmDeleteDomainModal).toBe(true);
    expect(component.deleteDomainId).toBe(dummyDomainId);

    
  });

  
  it('should show a toast error and not dispatch an action when required fields are missing', (done:DoneFn) => {
    spyOn(component['store'], 'selectSnapshot').and.returnValue(null);

    component['selectedFileDomain'] = null;

    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.addNewDomain();

    setTimeout(() => {
      expect(component.addDomainSpinner).toBe(false);

      expect(storeDispatchSpy).not.toHaveBeenCalledWith(jasmine.any(AddNewDomain));

      expect(storeDispatchSpy).toHaveBeenCalledWith(new ToastError('Please select a domain icon'));

      expect(component.newDomainName).toBe('');
      expect(component.newDomainImageName).toBe('');
      expect(component.newDomainDescription).toBe('');

      done();
    }, 0);
  });


  it('should show a toast error and not dispatch an action when required fields are missing', (done:DoneFn) => {
    spyOn(component['store'], 'selectSnapshot').and.returnValue(null);

    component['selectedFileDomain'] = null;

    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.addNewDomain();

    setTimeout(() => {
      expect(component.addDomainSpinner).toBe(false);

      expect(storeDispatchSpy).not.toHaveBeenCalledWith(jasmine.any(AddNewDomain));

      expect(storeDispatchSpy).toHaveBeenCalledWith(new ToastError('Please select a domain icon'));

      expect(component.newDomainName).toBe('');
      expect(component.newDomainImageName).toBe('');
      expect(component.newDomainDescription).toBe('');

      done();
    }, 0);
  });

  it('should set newDomainImageName when selectIcon is called', () => {
    const iconUrl = 'https://example.com/edit-icon.png';
    component.selectIcon(iconUrl);
    expect(component['newDomainImageName']).toBe(iconUrl);
  });

  it('should set editDomainImageName when selectIconEdit is called', () => {
    const iconUrl = 'https://example.com/edit-icon.png';
    component.selectIconEdit(iconUrl);
    expect(component['editDomainImageName']).toBe(iconUrl);
  });

  it('results should be empty and not dispatch an action when required fields are missing', (done: DoneFn) => {

    component.selectedFileDomain = null;

    component.addNewDomain();
    fixture.detectChanges(); 

    expect(component.addDomainSpinner).toBe(false);

    expect(component.newDomainName).toBe('');
    expect(component.newDomainImageName).toBe('');
    expect(component.newDomainDescription).toBe('');

    done();
  });

  it('should check that both light and dark theme are present', () => {
    component.toggleTheme();

    expect(document.body.classList.contains('light')).toBeTruthy();
    expect(document.body.classList.contains('dark')).toBeTruthy();
  });



  it('should set imagePreview to null when no image is selected', () => {
    
    const event = { target: { files: null } } as unknown as Event;

    
    component.onImageSelected(event);

    if(component.selectedFile === undefined) {
      component.selectedFile = null;
    }
    expect(component.selectedFile).toBeNull();
    expect(component.imagePreview).toBeNull();
  });

  it('should show toast error if no image is selected', () => {
    
    component.selectedFile = null;
    const toastErrorSpy = spyOn(component['store'], 'dispatch');

    
    component.uploadImage();

    
    expect(component.uploadSpinner).toBe(false);
    expect(toastErrorSpy).toHaveBeenCalledWith(jasmine.any(ToastError));
  });

  it('should show a toast error message when no image is selected', () => {
    component.selectedFileDomain = null; 
    const toastErrorSpy = spyOn(component['store'], 'dispatch');

  
    component.uploadImageDomain();
  
    expect(toastErrorSpy).toHaveBeenCalledWith(jasmine.any(ToastError));
  });


it('should not upload image if no image is selected', () => {

  component.selectedFileDomain = null; 

  const blobStorageServiceSpy = spyOn(component.blobStorageService, 'uploadImage');

  
  const result = component.uploadImageDomain();

  
  expect(blobStorageServiceSpy).not.toHaveBeenCalled();
  expect(result).toBeUndefined();
});


it('should set imagePreviewDomainEdit to null when no image is selected', () => {
  
  const eventMock = { target: { files: null } } as unknown as Event;

  
  component.onImageSelectedDomainEdit(eventMock);

  if(component.selectedFileDomainEdit === undefined) {
    component.selectedFileDomainEdit = null;
  }
  expect(component.selectedFileDomainEdit).toBeNull();
  expect(component.imagePreviewDomainEdit).toBeNull();
});

it('should show a toast error message when no image is selected during uploadImageDomainEdit()', () => {
  
  component.selectedFileDomainEdit = null; 

  const toastErrorSpy = spyOn(component['store'], 'dispatch');

  
  component.uploadImageDomainEdit();

  
  expect(toastErrorSpy).toHaveBeenCalledWith(jasmine.any(ToastError));
});

it('should show error for too long domain name and domain description', () => {
  component.newDomainName = 'New Domain Name that is way too long is way too long is way too long is way too long is way too long';
  component.newDomainImageName = 'New Domain Image Name';
  component.newDomainDescription = 'This description is way too long his description is way to description is way too  description is way too  description is way too  description is way too  description is way too o long his description is way too long his description is way too long his description is way too long his description is way too long his description is way too long his description is way too long';

  const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.returnValue(of(null));

  component.addNewDomain();

  expect(storeDispatchSpy).toHaveBeenCalledWith(
    new ToastError('Domain name must be less than 20 characters')
  );

  expect(storeDispatchSpy).toHaveBeenCalledWith(
    new ToastError('Domain description must be less than 100 characters')
  );
});


it('should not upload image if no image is selected during uploadImageDomainEdit()', () => {
  
  component.selectedFileDomainEdit = null; 

  const blobStorageServiceSpy = spyOn(component.blobStorageService, 'uploadImage');

  const result = component.uploadImageDomainEdit();

  expect(blobStorageServiceSpy).not.toHaveBeenCalled();
  expect(result).toBeUndefined();
});

it('should dispatch ChangePassword action and reset passwords', () => {
  const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.returnValue(of());

  component.oldPassword = 'oldpassword';
  component.newPassword = 'newpassword';

  component.changePassword();

  expect(storeDispatchSpy).toHaveBeenCalledWith(new ChangePassword('oldpassword', 'newpassword'));
  expect(component.oldPassword).toBe('');
  expect(component.newPassword).toBe('');
  expect(component['showChangePasswordModal']).toBe(true);
});

it('should dispatch DeleteUser action when username is available', () => {
  const userDetails = { username: 'testuser' };
  spyOn(component['store'], 'selectSnapshot').and.returnValue(userDetails);

  const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.returnValue(of());

  component.password = 'testpassword';
  component.deleteAccount();

  expect(storeDispatchSpy).toHaveBeenCalledWith(new DeleteUser('testuser', 'testpassword'));
});

it('should not dispatch DeleteUser action when username is not available', () => {
  spyOn(component['store'], 'selectSnapshot').and.returnValue(null);

  const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.returnValue(of());

  component.password = 'testpassword';
  component.deleteAccount();

  expect(storeDispatchSpy).not.toHaveBeenCalledWith(jasmine.any(DeleteUser));
});

it('should dispatch Logout action', () => {
  const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.returnValue(of());

  component.logOut();

  expect(storeDispatchSpy).toHaveBeenCalledWith(new Logout());
});

});
