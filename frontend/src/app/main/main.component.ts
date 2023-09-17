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
import { GenerateReport } from '../app.actions';
/* import { Demo2Setup, GetDomains, SetSourceIsLoading } from '../app.actions';
 */@Component({
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
    this.selectedDomain$.subscribe(domain => {
      this.selectedDomain = domain;
    });

    this.pdfUrl$.subscribe(res => {
      const pdfIndex: number = res.indexOf(".pdf");

      if (pdfIndex !== -1) {
          // Remove everything after ".pdf"
          const result: string = res.slice(0, pdfIndex + 4);
          console.log(result);
          this.pdfUrl = result;
      } else {
          console.log("'.pdf' not found in the URL");
      }
      
    });

    const copyIcon = document.getElementById('copyIcon');
    if (copyIcon) {
      copyIcon.addEventListener('click', () => {
        this.copyToClipboard();
      });
    }
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


  generateReport(){
    this.store.dispatch(new GenerateReport(this.selectedDomain!.id)).subscribe((res) => {
      if (res !== null) {
        console.log('PDF URL:', res.app.pdfUrl);
      } else {
        console.log('PDF URL is null');
      }
    });
  }

  copyToClipboard() {
    const reportLink = document.getElementById('reportLink');
    if (reportLink) {
      const textToCopy = reportLink.getAttribute('href')!;
      navigator.clipboard.writeText(textToCopy);
    }
  }
}
