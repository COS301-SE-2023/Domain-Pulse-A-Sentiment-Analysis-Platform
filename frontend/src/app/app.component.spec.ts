import { NgxsModule, Store } from '@ngxs/store';
import { AppComponent } from './app.component';
import { TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
describe('AppComponent', () => {
  let component: AppComponent;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppComponent],
      imports: [NgxsModule.forRoot([]), ToastrModule.forRoot()],
    });

    component = TestBed.inject(AppComponent);
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
