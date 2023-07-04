import { TestBed } from '@angular/core/testing';

import { MainComponent } from './main.component';
import { Actions, NgxsModule, ofActionDispatched } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetDomains } from '../app.actions';

describe('MainComponent', () => {
  let component: MainComponent;
  let actions$: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MainComponent],
      imports: [NgxsModule.forRoot([])],
    });

    component = TestBed.inject(MainComponent);
    actions$ = TestBed.inject(Actions);
  });

  it('should open the sidebar', () => {
    component.openSidebar();
    expect(component.sidebarCollapsed).toBeFalse();
  });

  it('should collapse the sidebar', (done) => {
    component.colapseSidebar();
    setTimeout(() => {
      expect(component.sidebarCollapsed).toBeTrue();
      done();
    }, 500);
  });

  // test constructor dispatches GetDomains action
  it('should dispatch GetDomains action OnInit', (done) => {
    actions$.pipe(ofActionDispatched(GetDomains)).subscribe((_) => {
      done();
    });

    component.ngOnInit();
  });
});
