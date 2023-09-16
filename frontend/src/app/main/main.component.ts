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
  selectedDomain!: DisplayDomain | null;


  sidebarCollapsed = true;
  showReportModal = false;

  constructor(private store: Store) {}
   ngOnInit(): void {
    this.selectedDomain$.subscribe(domain => {
      this.selectedDomain = domain;
    });
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
}
