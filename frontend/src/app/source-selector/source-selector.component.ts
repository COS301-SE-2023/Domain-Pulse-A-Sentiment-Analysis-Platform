import { Component } from '@angular/core';
import { AppState, DisplayDomain, DisplaySource } from '../app.state';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AddNewSource, DeleteSource, RefreshSourceData, SetSource, SetSourceIsLoading } from '../app.actions';

@Component({
  selector: 'source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.sass'],
})
export class SourceSelectorComponent {
  @Select(AppState.sources) sources$!: Observable<DisplaySource[] | null>;
  @Select(AppState.selectedSource)
  selectedSource$!: Observable<DisplaySource | null>;
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;
  
  showAddSourcesModal = false;
  showEditSourceModal = false;
  newSourceName = '';
  newSourcePlatform = '';
  newSourceUrl = '';

  constructor(private store: Store) {}

  selectSource(source: DisplaySource) {
    this.store.dispatch(new SetSourceIsLoading(true));
    this.store.dispatch(new SetSource(source));
  }

  addNewSource() {
    var params = this.determineSourceParams();
    console.log('params: ' + params);
    console.log('platform: ' + this.newSourcePlatform);
    this.store.dispatch(
      new AddNewSource(this.newSourceName, this.newSourcePlatform, params)
    );
    this.newSourceName = '';

    this.toggleAddSourcesModal();
  }

  determineSourceParams(): any | null {
    switch (this.newSourcePlatform) {
      case 'googlereviews':
        return {
          source_type: 'googlereviews',
          maps_url: this.newSourceUrl,
        }
      case 'tripadvisor':
        return {
          source_type: 'TripAdvisor',
          tripadvisor_url: this.newSourceUrl,
        }
      case 'youtube':
        const url = this.newSourceUrl;
        console.log('url: ' + url);
        const regExp =
          /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        console.log('match: ' + match);

        const videoID = match && match[7].length === 11 ? match[7] : null;
        return {
          source_type: 'youtube',
          video_id: videoID,
        };
    }
    return null;
  }

  refreshSource() {
    this.store.dispatch(new RefreshSourceData());
  }

  deleteSource() {
    this.store.dispatch(new DeleteSource());
  }

  selectPlatform(platform: string) {
    this.newSourcePlatform = platform;
  }

  editSource() {
    this.toggleEditSourceModal();
  }

  toggleAddSourcesModal() {
    if (!this.showAddSourcesModal) {
      this.showAddSourcesModal = true;
    } else {
      this.showAddSourcesModal = false;
    }
  }

  toggleEditSourceModal() {
    if (!this.showEditSourceModal) {
      this.showEditSourceModal = true;
    } else {
      this.showEditSourceModal = false;
    }
  }
}
