import { Component, OnInit } from '@angular/core';
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
import { GenerateReport, ToastError, ToastSuccess } from '../app.actions';
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
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;
  @Select(AppState.pdfLoading) pdfLoading$!: Observable<boolean>;
  @Select(AppState.pdfUrl) pdfUrl$!: Observable<string>;

  selectedDomain!: DisplayDomain | null;
  @Select(AppState.userHasNoDomains) userHasNoDomains$!: Observable<boolean>;
  @Select(AppState.userHasNoSources) userHasNoSources$!: Observable<boolean>;
  userHasNoDomains = false;
  userHasNoSources = false;

  sidebarCollapsed = true;
  showReportModal = false;
  commentsExpanded = false;
  pdfUrl!: string;

  constructor(private store: Store) {
    const commentsExpanded = window.localStorage.getItem('commentsExpanded');
    if (commentsExpanded) {
      this.commentsExpanded = commentsExpanded === 'true' ? true : false;
    }
    this.userHasNoDomains$.subscribe((userHasNoDomains: boolean) => {
      this.userHasNoDomains = userHasNoDomains;
    });
    this.userHasNoSources$.subscribe((userHasNoSources: boolean) => {
      this.userHasNoSources = userHasNoSources;
    });
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
      console.log(result);
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
    if (this.selectedDomain?.sources.length === 0) {
      this.store.dispatch(
        new ToastError(
          'You have no sources to generate a report from. Please add a source.'
        )
      );
      return;
    }
    if (!this.showReportModal) {
      this.generateReport();
      this.showReportModal = true;
    } else {
      this.showReportModal = false;
    }
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
}
