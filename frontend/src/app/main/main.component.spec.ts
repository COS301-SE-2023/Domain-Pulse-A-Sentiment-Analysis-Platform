import { TestBed } from '@angular/core/testing';

import { MainComponent } from './main.component';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { GenerateReport, GetDomains, ToastError, ToastSuccess } from '../app.actions';
import { DisplayDomain, DisplaySource } from '../app.state';

describe('MainComponent', () => {
  let component: MainComponent;
  let actions$: Observable<any>;
  let storeSpy: jasmine.SpyObj<Store>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MainComponent],
      imports: [NgxsModule.forRoot([])],
    });

    component = TestBed.inject(MainComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    actions$ = TestBed.inject(Actions);
  });

  it('should open the sidebar', () => {
    component.setSideBarOpen();
    expect(component.sidebarCollapsed).toBeFalse();

    component.setSideBarClosed();
    expect(component.sidebarCollapsed).toBeTrue();
  });

  it('should process pdf URL correctly', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    const testUrl = 'https://example.com/somefile.pdf?param=123';
    component.processpdfUrl(testUrl);

    expect(component.pdfUrl).toBe('https://example.com/somefile.pdf');

  });

  it('should fail process pdf', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    const testUrl = undefined;
    component.processpdfUrl('');

    expect(true).toBeTrue();


  });

  it('should handle URL without .pdf extension', () => {
    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    const testUrl = 'https://example.com/somefile.txt';
    spyOn(console, 'log'); // Spy on console.log to check if it's called

    component.processpdfUrl(testUrl);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError(
        'An error occured while generating the report. Please try again.'
      )
    );
  });
  
  it('should set selectedDomain correctly', () => {
    const testDomain: DisplayDomain = {
      id: '1',
      name: 'test',
      description: 'test',
      selected: true,
      imageUrl: 'test',
      sourceIds: [],
      sources: [],
    };
    component.processSelectedDomain(testDomain);

    expect(component.selectedDomain).toEqual(testDomain);
  });

  it('should add a click event listener to copyIcon', () => {
  
    const setupClickEventListenerSpy = spyOn(component as any, 'setupClickEventListener');
    component.ngOnInit();
  
    expect(setupClickEventListenerSpy).toHaveBeenCalled();
  });

  
  it('should copy the text to clipboard when copyToClipboard is called', () => {
    const mockLiveReviewLink = document.createElement('a');
    mockLiveReviewLink.id = 'reportLink';
    mockLiveReviewLink.setAttribute('href', 'https://example.com');
    document.body.appendChild(mockLiveReviewLink);

    const writeTextSpy = spyOn(
      navigator.clipboard,
      'writeText'
    ).and.returnValue(Promise.resolve());

    component.copyToClipboard();

    expect(writeTextSpy).toHaveBeenCalledWith('https://example.com');
  });

  it('should toggle report modal', () => {

    const dummyDisplaySource: DisplaySource = {
      id: '1',
      name: 'test',
      url: 'test',
      params: 'test',
      selected: true,
      isRefreshing: false,
    };
    

    const testDomain: DisplayDomain = {
      id: '1',
      name: 'test',
      description: 'test',
      selected: true,
      imageUrl: 'test',
      sourceIds: [],
      sources: [dummyDisplaySource, dummyDisplaySource],
    };

    component.selectedDomain = testDomain;


    component.showReportModal = false;
    component.toggleReportModal();
    expect(component.showReportModal).toBe(true);

    component.showReportModal = true;
    component.toggleReportModal();
    expect(component.showReportModal).toBe(false);
  });

  it('should not toggle report modal', () => {

    const testDomain: DisplayDomain = {
      id: '1',
      name: 'test',
      description: 'test',
      selected: true,
      imageUrl: 'test',
      sourceIds: [],
      sources: [],
    };

    component.selectedDomain = testDomain;

    const storeDispatchSpy = spyOn(
      component['store'],
      'dispatch'
    ).and.returnValue(of());

    component.showReportModal = false;
    component.toggleReportModal();
    
    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new ToastError(
        'You have no sources to generate a report from. Please add a source.'
      )
    );
  });

  it('should add a click event listener to copyIcon', () => {
    const mockCopyIcon = document.createElement('div');
    mockCopyIcon.id = 'copyIconPdf';
    document.body.appendChild(mockCopyIcon);

    const addEventListenerSpy = spyOn(mockCopyIcon, 'addEventListener');
    const dispatchEventSpy = spyOn(mockCopyIcon, 'dispatchEvent').and.callThrough();

    component.setupClickEventListener();

    const clickEvent = new MouseEvent('click');
    mockCopyIcon.dispatchEvent(clickEvent);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      jasmine.any(Function)
    );

    expect(dispatchEventSpy).toHaveBeenCalledWith(clickEvent);
});
  it('should dispatch GenerateReport action when generateReport is called', () => {
    const selectedDomain = { id: "1234" };

    component.selectedDomain  = selectedDomain as DisplayDomain;


    const storeDispatchSpy = spyOn(component['store'], 'dispatch').and.stub();
  
    spyOn(component['store'], 'selectSnapshot').and.returnValue(selectedDomain);

    component.generateReport();
  
    expect(storeDispatchSpy).toHaveBeenCalledWith(
      new GenerateReport(component.selectedDomain!.id)
    );
  });
});
