import { TestBed } from '@angular/core/testing';

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
  SetSource,
  SetSourceIsLoading,
} from '../app.actions';
import { DisplaySource, Source } from '../app.state';

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
    component.newSourcePlatform = 'Twitter';
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

  it('should test "determinePlatformFromNewSourcePlatform()"', () => {
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
  
  
	component.newSourcePlatform = 'youtube';
	component.newSourceUrl = 'https://www.youtube.com/embed/scWj1BMRHUA';
	expect(component.determineSourceParams()).toEqual({
	  source_type: 'youtube',
	  video_id: 'scWj1BMRHUA',
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
	const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.returnValue(of());
  
	component.refreshSource();
  
	expect(storeDispatchSpy).toHaveBeenCalledWith(new RefreshSourceData());
  });

  it('should dispatch SetAllSourcesSelected, SetSourceIsLoading, and SetSource actions', () => {
	const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.stub();
  
	component.selectAllSources();
  
	expect(storeDispatchSpy).toHaveBeenCalledWith(new SetAllSourcesSelected(true));
	expect(storeDispatchSpy).toHaveBeenCalledWith(new SetSourceIsLoading(true));
	expect(storeDispatchSpy).toHaveBeenCalledWith(new SetSource(null));
  });
  
});
