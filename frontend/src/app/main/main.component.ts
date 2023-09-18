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
  ],
})
export class MainComponent implements OnInit {
  @Select(AppState.selectedDomain)
  selectedDomain$!: Observable<DisplayDomain | null>;
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;
  @Select(AppState.pdfLoading) pdfLoading$!: Observable<boolean>;
  @Select(AppState.pdfUrl) pdfUrl$!: Observable<string>;

  selectedDomain!: DisplayDomain | null;

  sidebarCollapsed = true;
  showReportModal = false;
  pdfUrl!: string;

  constructor(private store: Store) {}
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
    const pdfIndex: number = res.lastIndexOf('.pdf');

    if (pdfIndex !== -1) {
      const result: string = res.slice(0, pdfIndex + 4);
      console.log(result);
      this.pdfUrl = result;
      this.store.dispatch(
        new ToastSuccess(
          'Your report has been generated!'
        )
      );
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

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleReportModal() {
    if (!this.showReportModal) {
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
