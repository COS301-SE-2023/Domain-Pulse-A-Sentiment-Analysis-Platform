import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable, first, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  AddNewDomain,
  DeleteDomain,
  EditDomain,
  SetDomain,
} from '../app.actions';
import { AppState, DisplayDomain } from '../app.state';
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
    spyOn(storeSpy, 'select').and.returnValue(of(null)); // be sure to mock the implementation here
    spyOn(storeSpy, 'selectSnapshot').and.returnValue(null); // same here

    actions$ = TestBed.inject(Actions);
    TestBed.inject(ToastrService);
    fixture.detectChanges();
  });

  /* it('should change the document.body.classlist theme property when toggleTheme() is called', () => {
    expect(component.theme).toBe(0);

    component.toggleTheme();
    expect(component.theme).toBe(1);
    console.log(document.body.classList);
    // expect(document.body.classList.contains('dark')).toBeTrue();
    // expect(document.body.classList.contains('light')).toBeFalse();

    component.toggleTheme();
    expect(component.theme).toBe(0);
    console.log(document.body.classList);
    // expect(document.body.classList.contains('dark')).toBeFalse();
    // expect(document.body.classList.contains('light')).toBeTrue();
  }); */

  it('should fire a "AddDomain" action', (done: DoneFn) => {
    component.newDomainName = 'New Domain Name';
    component.newDomainImageName = 'New Domain Image Name';
    component.newDomainDescription = 'New Domain Description';

    actions$.pipe(ofActionDispatched(AddNewDomain)).subscribe(() => {
      // expect the clearing of the set variables
      setTimeout(() => {
        expect(component.newDomainName).toBe('');
        expect(component.newDomainImageName).toBe('');
        expect(component.newDomainDescription).toBe('');

        done();
      }, 300);
    });

    component.addNewDomain();
  });

  it('should fire an "EditDomain" action', (done: DoneFn) => {
    // mock out teh selectSnapshot
    component.newDomainName = 'New Domain Name';
    component.newDomainImageName = 'New Domain Image Name';
    component.newDomainDescription = 'New Domain Description';

    actions$.pipe(ofActionDispatched(EditDomain)).subscribe(() => {
      // expect the clearing of the set variables
      setTimeout(() => {
        expect(component.newDomainName).toBe('');
        expect(component.newDomainImageName).toBe('');
        expect(component.newDomainDescription).toBe('');

        done();
      }, 300);
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

  it('should fire a "DeleteDomain" action', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(DeleteDomain)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const displayId = '1';
    component.deleteDomain(displayId);
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
    // test what happens afterwards

    component.expanded = false;
    expect(component.fullLogoState).toBe('out');
    expect(component._expanded).toBe(false);
    // test what happens afterwards
  });
});
