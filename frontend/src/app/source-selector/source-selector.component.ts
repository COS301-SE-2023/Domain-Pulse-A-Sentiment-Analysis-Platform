import { Component } from '@angular/core';
import { AppState, DisplayDomain } from '../app.state';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AddNewSource } from '../app.actions';

@Component({
  selector: 'source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.sass'],
})
export class SourceSelectorComponent {
  @Select(AppState.selectedDomain)
  selectedDomain$!: Observable<DisplayDomain | null>;

  showAddSourcesModal = false;
  newSouceName = '';
  newSourcePlatform = '';

  constructor(private store: Store) {}

  addNewSource() {
    console.log('platform: ' + this.newSourcePlatform);
    this.store.dispatch(
      new AddNewSource(this.newSouceName, this.newSourcePlatform)
    );
    this.newSouceName = '';

    this.toggleAddSourcesModal();
  }

  toggleAddSourcesModal() {
    if (!this.showAddSourcesModal) {
      this.showAddSourcesModal = true;
    } else {
      this.showAddSourcesModal = false;
    }
  }
}
