import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group,
  animateChild,
  query,
} from '@angular/animations';
import { AppState, DisplayDomain, DisplaySource } from '../app.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, filter, switchMap, take } from 'rxjs/operators';
import {
  GenerateReport,
  GuestModalChange,
  SwitchTutorialScreen,
  ToastError,
  ToastSuccess,
  ToggleReportGeneratorModal,
  ToggleTutorialModal,
} from '../app.actions';
/* import { Demo2Setup, GetDomains, SetSourceIsLoading } from '../app.actions';
 */ @Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  animations: [
    trigger('collapsed', [
      state(
        'collapsed',
        style({
          width: '5%',
        })
      ),
      state(
        'notCollapsed',
        style({
          width: '20%',
        })
      ),
      transition(
        'collapsed <=> notCollapsed',
        group([
          query('@smallLogoSwitch', [animateChild()], { optional: true }),
          query('@fullLogoSwitch', [animateChild()], { optional: true }),
          animate('0.3s ease-in-out'),
        ])
      ),
    ]),
    trigger('smallComments', [
      state('0', style({ marginTop: '0%' })),
      state('1', style({ marginTop: '-34.7vh' })),
      transition('0 => 1', [
        animate('0s', style({ marginTop: '0%' })),
        animate('0.175s', style({ marginTop: '0%' })),
        animate('0.4s ease-in-out', style({ marginTop: '-34.7vh' })),
      ]),
      transition('1 => 0', animate('0.4s ease-in-out')),
    ]),
    trigger('sourceSel', [
      state('0', style({ width: '97.5%' })),
      state('1', style({ width: '62%' })),
      transition('0 => 1', animate('0.175s ease-in-out')),
      transition('1 => 0', [
        animate('0s', style({ width: '62%' })),
        animate('0.32s', style({ width: '62%' })),
        animate('0.4s ease-in-out', style({ width: '97.5%' })),
      ]),
    ]),
    trigger('statSell', [
      state('0', style({ width: '100%' })),
      state('1', style({ width: '64%' })),
      transition('0 => 1', animate('0.175s ease-in-out')),
      transition('1 => 0', [
        animate('0s', style({ width: '64%' })),
        animate('0.32s', style({ width: '64%' })),
        animate('0.4s ease-in-out', style({ width: '100%' })),
      ]),
    ]),
  ],
})
export class MainComponent implements OnInit {
  @Select(AppState.selectedDomain)
  selectedDomain$!: Observable<DisplayDomain | null>;
  @Select(AppState.noData)
  noData$!: Observable<boolean>;
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;
  @Select(AppState.pdfLoading) pdfLoading$!: Observable<boolean>;
  @Select(AppState.pdfUrl) pdfUrl$!: Observable<string>;
  @Select(AppState.showReportGeneratorModal)
  showReportGeneratorModal$!: Observable<boolean>;
  @Select(AppState.showTutorialModal)
  showTutorialModal$!: Observable<boolean>;
  @Select(AppState.tutorialScreen)
  tutorialScreen$!: Observable<number>;

  selectedDomain!: DisplayDomain | null;
  @Select(AppState.userHasNoDomains) userHasNoDomains$!: Observable<boolean>;
  @Select(AppState.userHasNoSources) userHasNoSources$!: Observable<boolean>;
  userHasNoDomains = false;
  userHasNoSources = false;

  noData = false;

  selectedSource!: DisplaySource | undefined;

  sidebarCollapsed = true;
  showReportModal = false;
  showTutorialModal = false;
  commentsExpanded = false;
  pdfUrl!: string;

  @Select(AppState.showMakeAccountModal)
  showMakeAccountModal$!: Observable<boolean>;
  showGuestModal = true;
  canEdit: boolean = true;

  modalTimeout = false;

  lastOpenedModal: any[] = [];

  
  currentScreen = 1;
  totalScreens = 5; 

  constructor(private store: Store, private el: ElementRef) {
    const commentsExpanded = window.localStorage.getItem('commentsExpanded');
    if (commentsExpanded) {
      this.commentsExpanded = commentsExpanded === 'true' ? true : false;
    }
    this.store.select(AppState.canEdit).subscribe((canEdit: boolean) => {
      this.canEditChanged(canEdit);
    });

    this.userHasNoDomains$.subscribe((userHasNoDomains: boolean) => {
      this.userHasNoDomains = userHasNoDomains;
    });
    this.userHasNoSources$.subscribe((userHasNoSources: boolean) => {
      this.userHasNoSources = userHasNoSources;
    });

    this.noData$.subscribe((res) => {
      this.noData = res;
    });

    this.showMakeAccountModal$.subscribe((showMakeAccountModal: boolean) => {
      this.showGuestModal = showMakeAccountModal;
    });
  }

  canEditChanged(canEdit: boolean | undefined) {
    if (canEdit !== undefined) this.canEdit = canEdit;
  }

  saveExpandedState(val: boolean) {
    window.localStorage.setItem('commentsExpanded', val ? 'true' : 'false');
  }

  ngOnInit(): void {
    this.selectedDomain$.subscribe((domain) => {
      this.processSelectedDomain(domain!);
    });

    this.pdfUrl$.subscribe((res) => {
      this.processpdfUrl(res);
    });

    this.store.select(AppState.showReportGeneratorModal).subscribe((value) => {
      if (value == undefined) {
        return;
      }
      this.showReportModal = value;
    });

    this.store.select(AppState.showTutorialModal).subscribe((value) => {
      if (value == undefined) {
        return;
      }
      this.showTutorialModal = value;
    });

    this.store.select(AppState.tutorialScreen).subscribe((value) => {
      if (value == undefined) {
        return;
      }
      this.currentScreen = value;
    });

    this.setupClickEventListener();
  }

  expandCommentsHandler(event: boolean) {
    alert('i received the event: ' + event);
    this.commentsExpanded = event;
  }

  setupClickEventListener(): void {
    const copyIcon = document.getElementById('copyIconPdf');
    if (copyIcon) {
      copyIcon.addEventListener('click', () => {
        this.copyToClipboard();
      });
    }
  }

  processpdfUrl(res: string) {
    if (!res || res == '') return;
    const pdfIndex: number = res.lastIndexOf('.pdf');

    if (pdfIndex !== -1) {
      const result: string = res.slice(0, pdfIndex + 4);
      this.pdfUrl = result;
    } else {
      this.store.dispatch(
        new ToastError(
          'An error occured while generating the report. Please try again.'
        )
      );
    }
  }

  processSelectedDomain(domain: DisplayDomain) {
    this.selectedDomain = domain;
  }

  setSideBarClosed() {
    this.sidebarCollapsed = true;
  }

  setSideBarOpen() {
    this.sidebarCollapsed = false;
  }

  toggleReportModal() {
    if (!this.canEdit) {
      this.store.dispatch(new GuestModalChange(true));
      return;
    }

    if (this.selectedDomain?.sources.length === 0) {
      this.store.dispatch(
        new ToastError(
          'You have no sources to generate a report from. Please add a source.'
        )
      );
      return;
    }
    if (!this.showReportModal) {
      this.checkForData();
      this.generateReport();
      this.store.dispatch(new ToggleReportGeneratorModal());

      this.lastOpenedModal.push('reportModal');
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300);
    } else {
      this.pdfUrl = '';
      this.store.dispatch(new ToggleReportGeneratorModal());

      this.lastOpenedModal.pop();
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300);
    }
  }

  checkForData() {
    //loop through and print all the domain sources
    this.selectedDomain?.sources.forEach((source) => {
      console.log('source here');
      console.log(source);
    });
  }

  generateReport() {
    this.store.dispatch(new GenerateReport(this.selectedDomain!.id));
  }

  copyToClipboard() {
    const reportLink = document.getElementById('reportLink');
    if (reportLink) {
      const textToCopy = reportLink.getAttribute('href')!;
      navigator.clipboard.writeText(textToCopy);
    }
  }

  toggleGuestModal() {
    if (this.showGuestModal) {
      this.store.dispatch(new GuestModalChange(false));
    } else {
      this.store.dispatch(new GuestModalChange(true));
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.modalTimeout) {
      var modalDiv = this.getModalElement(
        this.lastOpenedModal[this.lastOpenedModal.length - 1]
      ); // Use a separate method
      if (!this.checkIfClickIn(event, modalDiv!)) {
        this.handleModalClick();
      }
    }
  }

  checkIfClickIn(event: MouseEvent, modalDiv: HTMLElement): boolean {
    if (!modalDiv) return false;
    var result = modalDiv && modalDiv.contains(event.target as Node);
    return result;
  }

  public getModalElement(search: string): HTMLElement | null {
    return this.el.nativeElement.querySelector('#' + search);
  }

  public handleModalClick() {
    switch (this.lastOpenedModal[this.lastOpenedModal.length - 1]) {
      case 'reportModal':
        if (this.showReportModal) {
          this.toggleReportModal();
        }
        break;
    }
  }

  toggleTutorialModal() {
    this.store.dispatch(new ToggleTutorialModal());
  }


  nextScreen(): void {
    if (this.currentScreen < this.totalScreens) {
      this.store.dispatch(new SwitchTutorialScreen(this.currentScreen + 1));
    }

  }

  prevScreen(): void {
    if (this.currentScreen > 1) {
      this.store.dispatch(new SwitchTutorialScreen(this.currentScreen - 1));
    }

  }
}
