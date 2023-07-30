import { TestBed } from '@angular/core/testing';

import { SourceSelectorComponent } from './source-selector.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { AppApi } from '../app.api';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AddNewSource, AttempPsswdLogin, SetSource } from '../app.actions';
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
			providers: [SourceSelectorComponent, { provide: AppApi, useValue: appApiSpy }],
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
});
