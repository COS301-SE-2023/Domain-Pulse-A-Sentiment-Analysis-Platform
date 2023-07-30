import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Initialise } from './app.actions';
import { AppState, ProfileDetails, Toast } from './app.state';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  @Select(AppState.profileDetails)
  profileDetails$!: Observable<ProfileDetails | null>;
  @Select(AppState.toasterError) toastError$!: Observable<Toast | null>;
  @Select(AppState.toasterSuccess) toastSuccess$!: Observable<Toast | null>;

  constructor(private store: Store, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.store.dispatch(new Initialise());
    this.profileDetails$.subscribe((profileDetails) => {
      if (profileDetails) {
        const mode = profileDetails.mode;
        document.body.classList.toggle('light', mode);
        document.body.classList.toggle('dark', !mode);
      }
    });

    this.toastError$.subscribe((toast) => {
      if (!toast) return;
      this.toastr.error(toast.message, '', {
        timeOut: toast.timeout,
        positionClass: 'toast-bottom-center',
        toastClass: 'custom-toast error ngx-toastr',
      });
    });

    this.toastSuccess$.subscribe((toast) => {
      if (!toast) return;
      this.toastr.success(toast.message, '', {
        timeOut: toast.timeout,
        positionClass: 'toast-bottom-center',
        toastClass: 'custom-toast success ngx-toastr',
      });
    });
  }
}
