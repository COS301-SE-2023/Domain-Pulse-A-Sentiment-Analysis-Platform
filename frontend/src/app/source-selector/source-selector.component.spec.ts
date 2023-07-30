import { TestBed } from '@angular/core/testing';

import { SourceSelectorComponent } from './source-selector.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  AddNewSource,
  AttempPsswdLogin,
  DeleteSource,
  EditSource,
  SetSource,
} from '../app.actions';
import { DisplaySource } from '../app.state';

describe('SourceSelectorComponent', () => {
  let component: SourceSelectorComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;

  beforeEach(() => {
    appApiSpy = jasmine.createSpyObj('AppApi', ['getSourceSentimentData']);
    appApiSpy.getSourceSentimentData.and.callThrough();

    TestBed.configureTestingModule({
      providers: [
        SourceSelectorComponent,
        { provide: AppApi, useValue: appApiSpy },
      ],
      imports: [NgxsModule.forRoot([]), FormsModule],
    });

    component = TestBed.inject(SourceSelectorComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    actions$ = TestBed.inject(Actions);
  });

  it('should fire a "AddNewSource" action', (done: DoneFn) => {
    component.newSourceName = 'New Domain Name';

    actions$.pipe(ofActionDispatched(AddNewSource)).subscribe(() => {
      // expect the clearing of the set variables
      setTimeout(() => {
        expect(component.newSourceName).toBe('');

        done();
      }, 300);
    });

    component.addNewSource();
  });

  it('should fire the "SetSource" action when selectSource function called', (done) => {
    actions$.pipe(ofActionDispatched(SetSource)).subscribe((_) => {
      expect(true).toBe(true);
      done();
    });

    const dummyDisplaySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    component.selectSource(dummyDisplaySource);
  });

  it('should toggle the add source modal', () => {
    component.showAddSourcesModal = false;
    component.toggleAddSourcesModal();
    expect(component.showAddSourcesModal).toBe(true);

    component.showAddSourcesModal = true;
    component.toggleAddSourcesModal();
    expect(component.showAddSourcesModal).toBe(false);
  });

  it('should toggle the delete source confirmation modal', () => {
    component.showConfirmDeleteSourceModal = false;
    component.toggleConfirmDeleteSourceModal();
    expect(component.showConfirmDeleteSourceModal).toBe(true);

    component.showConfirmDeleteSourceModal = true;
    component.toggleConfirmDeleteSourceModal();
    expect(component.showConfirmDeleteSourceModal).toBe(false);
  });

  it('should fire a "DeleteSource" action when deleteSource function called', () => {
    actions$.pipe(ofActionDispatched(DeleteSource)).subscribe((_) => {
      expect(component.showConfirmDeleteSourceModal).toBe(false);
      component.showConfirmDeleteSourceModal = true;
      component.deleteSource();
    });
  });

  it('should fire an "EditSource" action when editSource function called with different name', () => {
    const dummyDisplaySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    component.editSourceName = 'Edited Name';

    actions$.pipe(ofActionDispatched(EditSource)).subscribe((action) => {
      expect(action.name).toBe('Edited Name');
      expect(component.showEditSourceModal).toBe(false);
    });

    component.toggleEditSourceModal();
    component.editSource();
  });

  it('should call addNewSource and deleteSource when editSource function called with different url', () => {
    const dummyDisplaySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    component.editSourceUrl = 'Edited Url';

    spyOn(component, 'addNewSource');
    spyOn(component, 'deleteSource');

    component.toggleEditSourceModal();
    component.editSource();

    expect(component.addNewSource).toHaveBeenCalled();
    expect(component.deleteSource).toHaveBeenCalled();
    expect(component.showEditSourceModal).toBe(false);
  });
});
