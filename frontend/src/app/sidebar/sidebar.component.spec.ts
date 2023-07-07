import { TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AddNewDomain, EditDomain, SetDomain } from '../app.actions';
import { DisplayDomain } from '../app.state';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(() => {
    appApiSpy = jasmine.createSpyObj('AppApi', ['addDomain', 'editDomain', 'removeDomain']);
    appApiSpy.addDomain.and.callThrough();
    appApiSpy.editDomain.and.callThrough();
    appApiSpy.removeDomain.and.callThrough();

    TestBed.configureTestingModule({
      providers: [SidebarComponent, { provide: AppApi, useValue: appApiSpy }],
      imports: [NgxsModule.forRoot([]), FormsModule],
    });

    component = TestBed.inject(SidebarComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    actions$ = TestBed.inject(Actions);
  });

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
      id: 1,
      name: 'Dummy Domain',
      description: 'Dummy Description',
      selected: false,
      imageUrl: 'Dummy Image Url',
      sourceIds: [1, 2, 3],
    };

    component.selectDomain(dummyDisplayDomain);
  });

  it('should fire a "DeleteDomain" action', (done: DoneFn) => {
    actions$.pipe(ofActionDispatched(SetDomain)).subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    const displayId = 1;
    component.deleteDomain(displayId);
  });
});
