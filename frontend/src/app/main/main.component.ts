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
import {
  GenerateReport,
  GuestModalChange,
  ToastError,
  ToastSuccess,
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
  pdfUrl!: string;

  @Select(AppState.showMakeAccountModal)
  showMakeAccountModal$!: Observable<boolean>;
  showGuestModal = true;
  canEdit: boolean = true;

  constructor(private store: Store) {
    

    this.store.select(AppState.canEdit).subscribe((canEdit: boolean) => {
      this.canEditChanged(canEdit);
    });
    this.userHasNoDomains$.subscribe((userHasNoDomains: boolean) => {
      this.userHasNoDomains = userHasNoDomains;
    });
    this.userHasNoSources$.subscribe((userHasNoSources: boolean) => {
      this.userHasNoSources = userHasNoSources;
    });
    this.showMakeAccountModal$.subscribe((showMakeAccountModal: boolean) => {
      this.showGuestModal = showMakeAccountModal;
    });
  }

  canEditChanged(canEdit: boolean | undefined) {
    if (canEdit !== undefined) this.canEdit = canEdit;
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

  toggleGuestModal() {
    if (this.showGuestModal) {
      this.store.dispatch(new GuestModalChange(false));
    } else {
      this.store.dispatch(new GuestModalChange(true));
    }
  }
}
