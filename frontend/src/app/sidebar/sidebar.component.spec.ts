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
  ToggleAddDomainModal,
  ToggleChangePasswordModal,
  ToggleConfirmDeleteDomainModal,
  ToggleDeleteAccountModal,
  ToggleEditDomainModal,
  ToggleProfileEditModal,
  ToggleProfileModal,
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

  it('should initialize component properties from store', () => {
    // Set up mock data for the store observables
    const mockShowAddDomainModal = false;
    const mockShowProfileModal = false;
    const mockShowEditDomainModal = false;
    const mockShowConfirmDeleteDomainModal = false;


    // Trigger ngOnInit
    component.ngOnInit();

    // Expect component properties to be updated based on mock data
    expect(component.showAddDomainModal).toBe(mockShowAddDomainModal);
    expect(component.showProfileModal).toBe(mockShowProfileModal);
    expect(component.showEditDomainModal).toBe(mockShowEditDomainModal);
    expect(component.showConfirmDeleteDomainModal).toBe(mockShowConfirmDeleteDomainModal);
  });

  // Integration Test
  
  it('should fire a "AddDomain" action', (done: DoneFn) => {
    const dummyDisplayDomain: DisplayDomain = {
      id: '1',
      name: 'Dummy Domain',
      description: 'Dummy Description',
      selected: false,
      imageUrl: 'Dummy Image Url',
      sourceIds: ['1', '2', '3'],
      sources: [],
    };

    component.domains = [dummyDisplayDomain];
    
    component.newDomainName = 'New Domain Name';
    component.newDomainImageName = 'New Domain Image Name';
    component.newDomainDescription = 'New Domain Description';

    actions$.pipe(ofActionDispatched(AddNewDomain)).subscribe(() => {
      
      setTimeout(() => {
        expect(component.newDomainName).toBe('');
        expect(component.newDomainImageName).toBe('');
        expect(component.newDomainDescription).toBe('');
        expect(component.imagePreviewDomain).toBeNull();

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
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    
    const dummyDisplayDomain: DisplayDomain = {
      id: '1',
      name: 'Dummy Domain',
      description: 'Dummy Description',
      selected: false,
      imageUrl: 'Dummy Image Url',
      sourceIds: ['1', '2', '3'],
      sources: [],
    };

    component.domains = [dummyDisplayDomain];

    component.showAddDomainModal = false;
    component.toggleDomainModalOn();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleAddDomainModal());


    component.showAddDomainModal = true;
    component.toggleDomainModalOff();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleAddDomainModal());
  });

  it('should not toggle The domain flag', () => {

    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    const dummyDisplayDomain: DisplayDomain = {
      id: '1',
      name: 'Dummy Domain',
      description: 'Dummy Description',
      selected: false,
      imageUrl: 'Dummy Image Url',
      sourceIds: ['1', '2', '3'],
      sources: [],
    };

    component.domains = [dummyDisplayDomain, dummyDisplayDomain, dummyDisplayDomain, dummyDisplayDomain, dummyDisplayDomain, dummyDisplayDomain, dummyDisplayDomain, dummyDisplayDomain, dummyDisplayDomain, dummyDisplayDomain,];

    component.showAddDomainModal = false;
    component.toggleDomainModalOn();
    
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToastError('You have reached the maximum number of domains'));


  });

  it('should toggle domain flag if domains is undefined', () => {

    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    const dummyDisplayDomain: DisplayDomain = {
      id: '1',
      name: 'Dummy Domain',
      description: 'Dummy Description',
      selected: false,
      imageUrl: 'Dummy Image Url',
      sourceIds: ['1', '2', '3'],
      sources: [],
    };


    component.showAddDomainModal = false;
    component.toggleDomainModalOn();
    
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleAddDomainModal());



  });

  it('should toggle the Edit Domain Modal flag', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');


    component.showEditDomainModal = false;
    component.toggleEditDomainModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleEditDomainModal());

    component.showEditDomainModal = true;
    component.toggleEditDomainModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleEditDomainModal());
  });

  it('should toggle the Profile Modal', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    
    component.showProfileModal = false;
    component.toggleProfileModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleProfileModal());

    component.showProfileModal = true;
    component.toggleProfileModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleProfileModal());
  });

  it('toggle the edit profile modal', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.showProfileEditModal = false;
    component.toggleProfileEditModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleProfileEditModal());

    component.showProfileEditModal = true;
    component.toggleProfileEditModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleProfileEditModal());
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

  it('should fire closeSidebarClicked event when the sidebar is clicked', () => {
    let eventFired = false;
    component.closeSidebar.pipe(first()).subscribe(() => (eventFired = true));

    component.closeSidebarClicked();
    expect(eventFired).toBeTrue();
  });

  it('should fire openSidebarClicked event when the sidebar is clicked', () => {
    let eventFired = false;
    component.openSidebar.pipe(first()).subscribe(() => (eventFired = true));

    component.openSidebarClicked();
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
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');


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

    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleEditDomainModal());

    expect(component.editDomainName).toBe(dummyDisplayDomain.name);
    expect(component.editDomainImageName).toBe(dummyDisplayDomain.imageUrl);
    expect(component.editDomainDescription).toBe(dummyDisplayDomain.description);
  });

  it('should toggle the edit domain modal without setting editDomain properties if selectedDomain is not available', () => {
    spyOn(component['store'], 'selectSnapshot').and.returnValue(null);
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');


    component.showEditDomainModal = false;
    component.toggleEditDomainModal();

    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleEditDomainModal());
    expect(component.editDomainName).toBe(''); 
    expect(component.editDomainImageName).toBe('');
    expect(component.editDomainDescription).toBe('');
  });

  it('should set showEditDomainModal to false when calling toggleEditDomainModal if it was true', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.showEditDomainModal = true;

    component.toggleEditDomainModal();

    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleEditDomainModal());
  });


  it('should toggle the change password modal', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');


    component.showChangePasswordModal = false;
    component.toggleChangePasswordModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleChangePasswordModal());

    component.showChangePasswordModal = true;
    component.toggleChangePasswordModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleChangePasswordModal());
  });

  it('should toggle the delete account modal', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.showDeleteAccountModal = false;
    component.toggleDeleteAccountModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleDeleteAccountModal());

    component.showDeleteAccountModal = true;
    component.toggleDeleteAccountModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleDeleteAccountModal());
  });


  it('should toggle the confirm delete domain modal and set deleteDomainId if id is provided', () => {
    const dummyDomainId = '123';
    component.deleteDomainId = ''; 

    const storeDispatchSpy = spyOn(component['store'], 'dispatch');
    

    component.showConfirmDeleteDomainModal = true;
    component.toggleConfirmDeleteDomainModal();
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleConfirmDeleteDomainModal());
    expect(component.deleteDomainId).toBe('');

    component.showConfirmDeleteDomainModal = false;
    component.toggleConfirmDeleteDomainModal(dummyDomainId);
    expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleConfirmDeleteDomainModal());
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

it('should show error for too long domain name for editing', () => {
  component.editDomainName = 'New Domain Name that is way too long is way too too long';
  component.editDomainImageName = 'New Domain Image Name';
  component.editDomainDescription = 'This description is ws way too long';

  const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.returnValue(of(null));

  component.editDomain();

  expect(storeDispatchSpy).toHaveBeenCalledWith(
    new ToastError('Domain name must be less than 20 characters')
  );

});

it('should show error for too long domain description for editing', () => {
  component.editDomainName = 'New Domain';
  component.editDomainImageName = 'New Domain Image Name';
  component.editDomainDescription = 'This description is way too long his description is way to description is way too  description is way too  description is way too  description is way too  description is way too o long his description is way too long his description is way too long his description is way too long his description is way too long his description is way too long his description is way too long';

  const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.returnValue(of(null));

  component.editDomain();


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
  expect(storeDispatchSpy).toHaveBeenCalledWith(new ToggleChangePasswordModal());

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
