import { NgxsModule, Store } from '@ngxs/store';
import { AppComponent } from './app.component';
import { TestBed } from '@angular/core/testing';
describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppComponent],
      imports: [NgxsModule.forRoot([])],
    });

    component = TestBed.inject(AppComponent);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
