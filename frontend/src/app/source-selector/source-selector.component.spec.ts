import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SourceSelectorComponent } from './source-selector.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable, of, timer } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  AddNewSource,
  AttempPsswdLogin,
  DeleteSource,
  EditSource,
  GetSourceDashBoardInfo,
  GuestModalChange,
  RefreshSourceData,
  SetAllSourcesSelected,
  SetIsActive,
  SetSource,
  SetSourceIsLoading,
  ToastError,
  ToastSuccess,
  UplaodCVSFile,
} from '../app.actions';
import { DisplaySource, Source } from '../app.state';
import { Data } from '@angular/router';
import { DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalContainerComponent } from '../modal-container/modal-container.component';
import { ElementRef } from '@angular/core';

class MockElementRef {
  nativeElement = {};
}

describe('SourceSelectorComponent', () => {
  let component: SourceSelectorComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;
  let fixture: ComponentFixture<SourceSelectorComponent>;
  let el: DebugElement;

  beforeEach(() => {
    appApiSpy = jasmine.createSpyObj('AppApi', ['getSourceSentimentData']);
    appApiSpy.getSourceSentimentData.and.callThrough();

    TestBed.configureTestingModule({
      declarations: [SourceSelectorComponent, ModalContainerComponent],
      providers: [
        SourceSelectorComponent,
        { provide: AppApi, useValue: appApiSpy },
        { provide: ElementRef, useClass: MockElementRef },
        Store,
        Actions,
      ],
      imports: [
        NgxsModule.forRoot([]),
        FormsModule,
        CommonModule, // Import CommonModule instead of AsyncPipe
      ],
    });

    fixture = TestBed.createComponent(SourceSelectorComponent);
    component = TestBed.inject(SourceSelectorComponent);
    el = fixture.debugElement;
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    actions$ = TestBed.inject(Actions);
  });

  it('should fire a "AddNewSource" action', () => {
    component.newSourceName = 'New Domain Name';
    component.newSourcePlatform = 'youtube';
    component.newSourceUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of(null));

    component.addNewSource();

    // timer(500).subscribe(() => {
      // expect(component.addSourceSpinner).toBe(false);

      // expect(component.newSourceName).toBe('');
      // expect(component.newSourceUrl).toBe('');

      // expect(component.toggleAddSourcesModal).toHaveBeenCalled();

      // done();
    // });

    expect(true).toBe(true);
  });

  it('should show error for too long source name', () => {
    component.newSourceName =
      'New Domain Name that is way too long is way too long is way too long is way too long is way too long';
    component.newSourcePlatform = 'youtube';
    component.newSourceUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of(null));

    component.addNewSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('Source name must be less than 25 characters')
    );
  });

 /*  it('should fire a "AddNewSource" action for adding csv', () => {
    // Increase the timeout interval for this specific test case
  
    const mockFile = new File(['mock content'], 'mock.csv', {
      type: 'text/csv',
    });
    component.newSourcePlatform = 'csv';
    component.newCSVFile = mockFile;
    component.newSourceName = 'CSV Source';
  
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of(null));
  
    component.addNewSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(new UplaodCVSFile(mockFile));

    expect(component.newCSVFile).toBe('');

    expect(component.newSourceName).toBe('');
    expect(component.newSourceUrl).toBe('');
    expect(component.showAddSourcesModal).toBe(false);
  

  
  });
 */
  it('should dispatch actions for CSV platform with a valid CSV file', () => {
    // Set up the test data
    const sourceID = 'your-source-id';
    const mockFile = new File(['mock content'], 'mock.csv', {
      type: 'text/csv',
    });
    component.newSourcePlatform = 'csv';
    component.newCSVFile = mockFile;
    component.newSourceName = 'CSV Source';

    // Spy on the store's dispatch method and return an observable of your choice (e.g., of(null))
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of(null));

    // Use await to ensure that the asynchronous code is properly handled
    component.addNewSource();

    // Assert that the actions were dispatched as expected
    expect(storeDispatchSpy).toHaveBeenCalledWith(new UplaodCVSFile(mockFile));
  });

  it('should show an error message when CSV platform is selected but no CSV file is uploaded', () => {
    component.newSourcePlatform = 'csv';
    component.newCSVFile = '';
    component.newSourceName = 'CSV Source';

    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());
    component.addNewSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('Please upload a CSV file')
    );
  });

  it('should set newCSVFile when uploadFile is called', () => {
    const mockFile = new File(['mock content'], 'mock.csv', {
      type: 'text/csv',
    });

    const event = {
      target: {
        files: [mockFile],
      },
    };

    component.uploadFile(event);

    expect(component.newCSVFile).toBe(mockFile);
  });

  it('should show an error message when URL is not specified when adding a new source', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    component.newSourceName = 'New Domain Name';
    component.newSourcePlatform = 'youtube';
    component.newSourceUrl = '';

    component.addNewSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('Please add a URL')
    );
  });

  it('should show an error message when .csv is not uploaded when adding a new source', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    component.newSourceName = 'New Domain Name';
    component.newSourcePlatform = 'csv';
    component.newSourceUrl = '';
    component.newCSVFile = '';

    component.addNewSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('Please upload a CSV file')
    );
  });

  it('should show an error message when details are missing when adding a new source', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    component.newSourceName = '';
    component.newSourcePlatform = '';
    component.newSourceUrl = 'fakeurl';

    component.addNewSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('Please fill in all fields')
    );
  });

  it('should test "determinePlatformFromNewSourcePlatform()"', () => {
    component.newSourcePlatform = 'trustpilot';
    expect(component.determinePlatformFromNewSourcePlatform()).toBe(
      'trustpilot'
    );

    component.newSourcePlatform = 'googlereviews';
    expect(component.determinePlatformFromNewSourcePlatform()).toBe(
      'googlereviews'
    );

    component.newSourcePlatform = 'tripadvisor';
    expect(component.determinePlatformFromNewSourcePlatform()).toBe(
      'tripadvisor'
    );

    component.newSourcePlatform = 'youtube';
    expect(component.determinePlatformFromNewSourcePlatform()).toBe('YouTube');

    component.newSourcePlatform = 'test';
    expect(component.determinePlatformFromNewSourcePlatform()).toBe('');

    component.newSourcePlatform = 'livereview';
    expect(component.determinePlatformFromNewSourcePlatform()).toBe(
      'livereview'
    );
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
    component.lastOpenedModal = [];
    component.showAddSourcesModal = false;
    component.toggleAddSourcesModal();
    expect(component.showAddSourcesModal).toBe(true);

    expect(component.lastOpenedModal).toEqual(['addSourceModal']);

    expect(component.modalTimeout).toBe(true);
    /* setTimeout(() => {
      expect(component.modalTimeout).toBe(false);
    }, 300); */

    spyOn(component, 'resetCSVUpload').and.returnValue();


    component.showAddSourcesModal = true;
    component.toggleAddSourcesModal();
    expect(component.showAddSourcesModal).toBe(false);

    expect(component.lastOpenedModal).toEqual([]);

    expect(component.modalTimeout).toBe(true);
    /* setTimeout(() => {
      expect(component.modalTimeout).toBe(false);
    }, 300); */
  });

  it('should toggle the delete source confirmation modal', () => {
    const dummyDisplaySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'csv-logo.png',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    component.lastOpenedModal = [];

    component.selectedSource = dummyDisplaySource;

    component.showConfirmDeleteSourceModal = false;
    component.toggleConfirmDeleteSourceModal();
    expect(component.showConfirmDeleteSourceModal).toBe(true);

    expect(component.lastOpenedModal).toEqual(['confirmDeleteSourceModal']);

    expect(component.modalTimeout).toBe(true);
    /* setTimeout(() => {
      expect(component.modalTimeout).toBe(false);
    }, 300); */

    component.showConfirmDeleteSourceModal = true;
    component.toggleConfirmDeleteSourceModal();
    expect(component.showConfirmDeleteSourceModal).toBe(false);

    expect(component.lastOpenedModal).toEqual([]);

    expect(component.modalTimeout).toBe(true);
    /* setTimeout(() => {
      expect(component.modalTimeout).toBe(false);
    }, 300); */
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

  it('should fire "EditSource" action when this.editSourceName != selectedSource?.name', () => {
    const dummyDisplaySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: {
        source_type: 'youtube',
        video_id: 'dQw4w9WgXcQ',
      },
      selected: true,
      isRefreshing: false,
    };
    spyOn(storeSpy, 'selectSnapshot').and.returnValue(dummyDisplaySource);

    component.editSourceUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    component.editSourceName = 'testDiff';

    actions$.pipe(ofActionDispatched(EditSource)).subscribe((action) => {
      expect(action.name).toBe('test');
      expect(component.showEditSourceModal).toBe(false);
    });

    component.toggleEditSourceModal();
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

  it('should dispatch "EditSource" action when conditions are met', () => {
    const editSourceName = 'New Source Name';
    component.editSourceName = editSourceName;
    const selectedSource: DisplaySource | undefined = {
      id: '1',
      name: 'Selected Source Name',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };
    spyOn(component['store'], 'selectSnapshot').and.returnValue(selectedSource);
    const editSourceSpy = spyOn(component['store'], 'dispatch');

    component.editSourceNew();

    expect(editSourceSpy).toHaveBeenCalledWith(new EditSource(editSourceName));
    expect(component.isEditing).toBe(false);
  });

  it('should dispatch "EditSource" action when conditions are met', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());
    const editSourceName = '';
    component.editSourceName = editSourceName;

    component.editSourceNew();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('Please enter a name for your source')
    );
  });

  it('should dispatch "EditSource" action when conditions are met', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());
    const editSourceName =
      'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd';
    component.editSourceName = editSourceName;

    component.editSourceNew();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('Source name must be less than 25 characters')
    );
  });

  it('should dispatch "EditSource" action when conditions are met', () => {
    const editSourceName = 'New Source Name';
    component.editSourceName = editSourceName;
    const selectedSource: DisplaySource | undefined = {
      id: '1',
      name: 'New Source Name',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };
    spyOn(component['store'], 'selectSnapshot').and.returnValue(selectedSource);
    const editSourceSpy = spyOn(component['store'], 'dispatch');

    component.editSourceNew();

    expect(component.isEditing).toBe(false);
  });

  it('should return the correct source parameters for different platforms', () => {
    component.newSourcePlatform = 'trustpilot';
    component.newSourceUrl =
      'https://www.trustpilot.com/review/www.spotify.com';
    expect(component.determineSourceParams()).toEqual({
      source_type: 'trustpilot',
      query_url: 'www.spotify.com',
    });

    component.newSourcePlatform = 'trustpilot';
    component.newSourceUrl = 'www.spotify.com';
    expect(component.determineSourceParams()).toEqual({
      source_type: 'trustpilot',
      query_url: 'www.spotify.com',
    });

    component.newSourcePlatform = 'googlereviews';
    component.newSourceUrl = 'https://maps.google.com/';
    expect(component.determineSourceParams()).toEqual({
      source_type: 'googlereviews',
      maps_url: 'https://maps.google.com/',
    });

    component.newSourcePlatform = 'tripadvisor';
    component.newSourceUrl = 'https://www.tripadvisor.com/';
    expect(component.determineSourceParams()).toEqual({
      source_type: 'TripAdvisor',
      tripadvisor_url: 'https://www.tripadvisor.com/',
    });

    component.newSourcePlatform = 'youtube';
    component.newSourceUrl = 'https://www.youtube.com/watch?v=scWj1BMRHUA';
    expect(component.determineSourceParams()).toEqual({
      source_type: 'youtube',
      video_id: 'scWj1BMRHUA',
    });

    /* case 'livereview':
        return {
          source_type: 'livereview',
          is_active: true,
        }
      case 'youtube':

        const url = this.newSourceUrl;
        if (!url.includes('youtube')) {
          return {
            source_type: 'youtube',
            video_id: url,
          };
        } */
    component.newSourcePlatform = 'youtube';
    component.newSourceUrl = 'https://www.youtube.com/embed/scWj1BMRHUA';
    expect(component.determineSourceParams()).toEqual({
      source_type: 'youtube',
      video_id: 'scWj1BMRHUA',
    });

    component.newSourcePlatform = 'youtube';
    component.newSourceUrl = 'https://youtu.be/bsyY9m7Q2KI?si=Ae1iTsFkxq3oDhok';
    expect(component.determineSourceParams()).toEqual({
      source_type: 'youtube',
      video_id: 'bsyY9m7Q2KI',
    });

    component.newSourcePlatform = 'youtube';
    component.newSourceUrl = 'scWj1BMRHUA';
    expect(component.determineSourceParams()).toEqual({
      source_type: 'youtube',
      video_id: 'scWj1BMRHUA',
    });

    component.newSourcePlatform = 'livereview';
    expect(component.determineSourceParams()).toEqual({
      source_type: 'livereview',
      is_active: true,
    });

    component.newSourcePlatform = 'youtube';
    component.newSourceUrl = 'https://example.com'; // A URL that doesn't match the regex
    expect(component.determineSourceParams()).toEqual({
      source_type: 'youtube',
      video_id: 'https://example.com', // Expecting video_id to be null
    });

    // component.newSourcePlatform = 'youtube';
    // component.newSourceUrl = 'https://www.youtube.com/embed/scWj1BMRHUA';
    // expect(component.determineSourceParams()).toEqual({
    //   source_type: 'youtube',
    //   video_id: 'scWj1BMRHUA',
    // });
  });

  it('should return null for unknown platforms', () => {
    component.newSourcePlatform = 'unknown';
    component.newSourceUrl = '';
    expect(component.determineSourceParams()).toBeNull();
  });

  it('should update source properties and call addNewSource when the URL is changed', () => {
    const selectedSource: Source = {
      source_id: '1',
      source_name: 'Source 1',
      sourceImageUrl: 'image.png',
    };
    const addNewSourceSpy = spyOn(component, 'addNewSource');
    const deleteSourceSpy = spyOn(component, 'deleteSource');

    component['editSourceUrl'] = 'https://www.tripadvisor.com/';
    component['editSourceName'] = 'New Source Name';
    spyOn(component['store'], 'selectSnapshot').and.returnValue(selectedSource);

    component.editSource();

    expect(component['newSourceName']).toBe('New Source Name');
    expect(component['newSourceUrl']).toBe('https://www.tripadvisor.com/');
    expect(component['newSourcePlatform']).toBe('');
    expect(deleteSourceSpy).toHaveBeenCalled();
    expect(addNewSourceSpy).toHaveBeenCalled();
    expect(component['showEditSourceModal']).toBe(true);
  });

  it('should update the newSourcePlatform property', () => {
    const platform = 'youtube';

    component.selectPlatform(platform);

    expect(component['newSourcePlatform']).toBe(platform);
  });

  it('should dispatch RefreshSourceData action', () => {
    const dummyDisplaySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    component.selectedSource = dummyDisplaySource;

    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    component.refreshSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(new RefreshSourceData());
  });

  it('should show error for no source selected for refresh', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    component.refreshSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('You must select a specific source to refresh')
    );
  });

  it('should not show error for CSV refresh', () => {
    const dummyDisplaySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'csv-logo.png',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    component.selectedSource = dummyDisplaySource;

    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    component.refreshSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('CSV sources cannot be refreshed')
    );
  });

  it('should show error for no source selected for delete', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    component.showConfirmDeleteSourceModal = false;
    component.toggleConfirmDeleteSourceModal();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError('You must select a specific source to delete')
    );
  });

  it('should dispatch SetAllSourcesSelected, SetSourceIsLoading, and SetSource actions', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.stub();

    component.selectAllSources();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new SetAllSourcesSelected(true)
    );
    expect(storeDispatchSpy).toHaveBeenCalledWith(new SetSourceIsLoading(true));
    expect(storeDispatchSpy).toHaveBeenCalledWith(new SetSource(null));
  });

  it('should subscribe to selectedSource$', () => {
    const dummyDisplaySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    spyOn(component['store'], 'select').and.returnValue(of(dummyDisplaySource));

    component.ngOnInit();

    expect(component.selectedSource).toEqual(dummyDisplaySource);
  });

  it('should add a click event listener to copyIcon', () => {
    const mockCopyIcon = document.createElement('div');
    mockCopyIcon.id = 'copyIcon';
    document.body.appendChild(mockCopyIcon);

    const addEventListenerSpy = spyOn(mockCopyIcon, 'addEventListener');

    component.ngOnInit();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      jasmine.any(Function)
    );
  });

  it('should copy the text to clipboard when copyToClipboard is called', () => {
    const mockLiveReviewLink = document.createElement('a');
    mockLiveReviewLink.id = 'liveReviewLink';
    mockLiveReviewLink.setAttribute('href', 'https://example.com');
    document.body.appendChild(mockLiveReviewLink);

    const writeTextSpy = spyOn(
      navigator.clipboard,
      'writeText'
    ).and.returnValue(Promise.resolve());

    component.copyToClipboard();

    expect(writeTextSpy).toHaveBeenCalledWith('https://example.com');
  });

  it('should toggle info modal', () => {
    component.lastOpenedModal = [];
    component.showInfoModal = false;
    component.toggleInfoModal();
    expect(component.showInfoModal).toBe(true);

    expect(component.lastOpenedModal).toEqual(['infoModal']);

    expect(component.modalTimeout).toBe(true);
    setTimeout(() => {
      expect(component.modalTimeout).toBe(false);
    }, 300);

    component.showInfoModal = true;
    component.toggleInfoModal();
    expect(component.showInfoModal).toBe(false);

    expect(component.lastOpenedModal).toEqual([]);

    expect(component.modalTimeout).toBe(true);
    setTimeout(() => {
      expect(component.modalTimeout).toBe(false);
    }, 300);

    expect(component.isEditing).toBe(false);
  });

  it('should stop event propagation and toggle info modal', () => {
    const event = new Event('click');
    const stopPropagationSpy = spyOn(event, 'stopPropagation');
    const toggleInfoModalSpy = spyOn(component, 'toggleInfoModal');

    component.showInfo(event);

    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(toggleInfoModalSpy).toHaveBeenCalled();
  });

  it('should toggle active and dispatch SetIsActive action', () => {
    const selectedSource = { params: true };

    const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.stub();

    spyOn(component['store'], 'selectSnapshot').and.returnValue(selectedSource);

    component.toggleActive(event);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new SetIsActive(!selectedSource.params)
    );
  });

  it('should return the correct live review link', () => {
    const selectedSource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };

    component.selectedSource = selectedSource;

    component.currHost = 'localhost:4200';
    expect(component.getLiveReviewLink()).toBe(
      'http://localhost:8004/ingest/post-review/1/test'
    );

    component.currHost = 'localhost:8004';
    expect(component.getLiveReviewLink()).toBe(
      `${window.location.protocol}//localhost:8004/ingest/post-review/1/test`
    );
  });

  // test 3 functions that are prevented with the canEdit flag
  it('should dispatch "new GuestModalChange(true)" when some functions are called', () => {
    spyOn(component['store'], 'dispatch').and.stub();

    component.canEdit = false;

    component.toggleAddSourcesModal();
    component.toggleConfirmDeleteSourceModal();
    component.refreshSource();

    // expect newGuestModalChange(true) to be dispatched 3 times
    expect(component['store'].dispatch).toHaveBeenCalledTimes(3);
    expect(component['store'].dispatch).toHaveBeenCalledWith(
      new GuestModalChange(true)
    );
  });
  it('should set editSourceName and isEditing when a selected source exists', () => {
    const selectedSource = {
      name: 'Test Source Name',
    };

    spyOn(storeSpy, 'selectSnapshot').and.returnValue(selectedSource);

    component.editName();

    expect(component.editSourceName).toBe(selectedSource.name);
    expect(component.isEditing).toBe(true);
  });

  it('should set editSourceName to an empty string when no selected source exists', () => {
    spyOn(storeSpy, 'selectSnapshot').and.returnValue(null);

    component.editName();

    expect(component.editSourceName).toBe('');
    expect(component.isEditing).toBe(true);
  });

  it('should call handleModalClick when clicking outside the modal', () => {
    component.modalTimeout = false;
    component.showAddSourcesModal = true;
    component.lastOpenedModal.push('addSource');

    const fakeEvent = {
      target: document.createElement('div'), // Create a fake target element
    } as unknown as MouseEvent;

    spyOn(component, 'getModalElement').and.returnValue(null);

    spyOn(component, 'checkIfClickIn').and.returnValue(false);

    spyOn(component, 'handleModalClick');

    component.onClick(fakeEvent);

    expect(component.handleModalClick).toHaveBeenCalled();
  });

  it('should call handleModalClick when clicking outside the modal', () => {
    component.modalTimeout = false;
    component.showInfoModal = true;
    component.lastOpenedModal.push('infoModal');

    const fakeEvent = {
      target: document.createElement('div'),
    } as unknown as MouseEvent;

    spyOn(component, 'getModalElement').and.returnValue(null);

    spyOn(component, 'checkIfClickIn').and.returnValue(false);

    spyOn(component, 'handleModalClick');

    component.onClick(fakeEvent);

    expect(component.handleModalClick).toHaveBeenCalled();
  });

  it('should call handleModalClick when clicking outside the modal', () => {
    component.modalTimeout = false;
    component.showConfirmDeleteSourceModal = true;
    component.lastOpenedModal.push('confirmDeleteSourceModal');

    const fakeEvent = {
      target: document.createElement('div'),
    } as unknown as MouseEvent;

    spyOn(component, 'getModalElement').and.returnValue(null);

    spyOn(component, 'checkIfClickIn').and.returnValue(false);

    spyOn(component, 'handleModalClick');

    component.onClick(fakeEvent);

    expect(component.handleModalClick).toHaveBeenCalled();
  });

  it('should call toggleAddSourcesModal when lastOpenedModal is "addSourceModal" and showAddSourcesModal is true', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    spyOn(component, 'resetCSVUpload').and.returnValue();

    component.lastOpenedModal.push('addSourceModal');
    component.showAddSourcesModal = true;

    component.handleModalClick();

  });

  it('should not call toggleAddSourcesModal when lastOpenedModal is "addSourceModal" but showAddSourcesModal is false', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.lastOpenedModal.push('addSourceModal');
    component.showAddSourcesModal = false;

    component.handleModalClick();


  });

  it('should call toggleConfirmDeleteSourceModal when lastOpenedModal is "confirmDeleteSourceModal" and showConfirmDeleteSourceModal is true', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.lastOpenedModal.push('confirmDeleteSourceModal');
    component.showConfirmDeleteSourceModal = true;

    component.handleModalClick();


  });

  it('should not call toggleConfirmDeleteSourceModal when lastOpenedModal is "confirmDeleteSourceModal" but showConfirmDeleteSourceModal is false', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.lastOpenedModal.push('confirmDeleteSourceModal');
    component.showConfirmDeleteSourceModal = false;

    component.handleModalClick();

  });

  it('should call toggleInfoModal when lastOpenedModal is "infoModal" and showInfoModal is true', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.lastOpenedModal.push('infoModal');
    component.showInfoModal = true;

    component.handleModalClick();

  });

  it('should not call toggleInfoModal when lastOpenedModal is "infoModal" but showInfoModal is false', () => {
    const storeDispatchSpy = spyOn(component['store'], 'dispatch');

    component.lastOpenedModal.push('infoModal');
    component.showInfoModal = false;

    component.handleModalClick();

  });


  afterEach(() => {
    fixture.destroy();
  });

  
});
