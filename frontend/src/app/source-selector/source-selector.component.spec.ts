import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SourceSelectorComponent } from './source-selector.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  AddNewSource,
  AttempPsswdLogin,
  DeleteSource,
  EditSource,
  RefreshSourceData,
  SetAllSourcesSelected,
  SetIsActive,
  SetSource,
  SetSourceIsLoading,
  ToastError,
} from '../app.actions';
import { DisplaySource, Source } from '../app.state';
import { Data } from '@angular/router';

describe('SourceSelectorComponent', () => {
  let component: SourceSelectorComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let appApiSpy: jasmine.SpyObj<AppApi>;
  let actions$: Observable<any>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    appApiSpy = jasmine.createSpyObj('AppApi', ['getSourceSentimentData']);
    appApiSpy.getSourceSentimentData.and.callThrough();

    TestBed.configureTestingModule({
      providers: [
        SourceSelectorComponent,
        { provide: AppApi, useValue: appApiSpy },
      ],
      imports: [NgxsModule.forRoot([]), FormsModule, HttpClientModule, HttpClientTestingModule],
    });

    component = TestBed.inject(SourceSelectorComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    actions$ = TestBed.inject(Actions);
  });

  it('should fire a "AddNewSource" action', (done: DoneFn) => {
    component.newSourceName = 'New Domain Name';
    component.newSourcePlatform = 'youtube';
    component.newSourceUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    spyOn(component, 'determineSourceParams').and.returnValue({
      source_type: 'youtube',
      video_id: 'dQw4w9WgXcQ',
    });

    actions$.pipe(ofActionDispatched(AddNewSource)).subscribe(() => {
      // expect the clearing of the set variables
      setTimeout(() => {
        expect(component.newSourceName).toBe('');
        expect(component.newSourceUrl).toBe('');
        expect(component.showAddSourcesModal).toBe(false);

        done();
      }, 300);
    });

    component.addNewSource();
  });

  it('should fire a "AddNewSource" action for adding csv', (done: DoneFn) => {
    component.newSourceName = 'CSV Source';
    component.newSourcePlatform = 'csv';
    component.newCSVFile = new File(['mock content'], 'mock.csv', { type: 'text/csv' });

    actions$.pipe(ofActionDispatched(AddNewSource)).subscribe(() => {
      setTimeout(() => {
        expect(component.newSourceName).toBe('');
        expect(component.newSourceUrl).toBe('');
        expect(component.showAddSourcesModal).toBe(false);

        done();
      }, 300);
    });

    component.addNewSource();
  });

  /* it('should fire a "AddNewSource" action for CSV source', (done: DoneFn) => {
    component.newSourceName = 'CSV Source';
    component.newSourcePlatform = 'csv';
  
    // Mock determineSourceParams since it's not used for CSV platform
    spyOn(component, 'determineSourceParams').and.returnValue(null);
  
    actions$.pipe(ofActionDispatched(AddNewSource)).subscribe(() => {
      // Expectations for the "AddNewSource" action when the platform is 'csv'
      expect(component.newSourceName).toBe('');
      expect(component.showAddSourcesModal).toBe(false);
  
      // Ensure that the "AddNewSource" action is dispatched with the correct platform
      const dispatchedAction = Store.dispatch.calls.mostRecent().args[0];
      expect(dispatchedAction.constructor).toBe(AddNewSource);
      expect(dispatchedAction.name).toBe('CSV Source');
      expect(dispatchedAction.platform).toBe('csv');
  
      done();
    });
  
    component.addNewSource();
  }); */

  it('should set newCSVFile when uploadFile is called', () => {
    const mockFile = new File(['mock content'], 'mock.csv', { type: 'text/csv' });

    const event = {
      target: {
        files: [mockFile],
      },
    };

    component.uploadFile(event);

    expect(component.newCSVFile).toBe(mockFile);
  });

  it('should send a file with sourceID when sendFile is called', () => {
    const sourceID = '65034fff5aff62e633eb690b';
    const mockFile = new File(['mock content'], 'mock.csv', { type: 'text/csv' });
  
    spyOn(storeSpy, 'selectSnapshot').and.returnValue({ id: sourceID });
  
    component.newCSVFile = mockFile;
  
    component.sendFile(sourceID);
  
    const testUrl = '/api/warehouse/ingest/ingest_csv/';
    const testData = {};
  
    httpClient.get<Data>(testUrl).subscribe(data => {
      console.log("test data: " + data)
      expect(data).toEqual(testData);

      httpTestingController.verify();
    });
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

  it('should return the correct source parameters for different platforms', () => {
    component.newSourcePlatform = 'trustpilot';
    component.newSourceUrl = 'https://www.trustpilot.com/review/www.spotify.com';
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
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    component.refreshSource();

    expect(storeDispatchSpy).toHaveBeenCalledWith(new RefreshSourceData());
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
    component.showInfoModal = false;
    component.toggleInfoModal();
    expect(component.showInfoModal).toBe(true);

    component.showInfoModal = true;
    component.toggleInfoModal();
    expect(component.showInfoModal).toBe(false);
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
});
