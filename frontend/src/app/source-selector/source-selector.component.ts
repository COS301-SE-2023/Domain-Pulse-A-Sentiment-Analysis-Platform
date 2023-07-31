import { Component } from '@angular/core';
import { AppState, DisplayDomain, DisplaySource } from '../app.state';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AddNewSource, DeleteSource, EditSource, RefreshSourceData, SetAllSourcesSelected, SetSource, SetSourceIsLoading } from '../app.actions';

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
  @Select(AppState.allSourcesSelected) allSources$!: Observable<number>;


  showAddSourcesModal = false;
  showEditSourceModal = false;
  showConfirmDeleteSourceModal = false;
  newSourceName = '';
  newSourcePlatform = '';
  newSourceUrl = '';

  editSourceName = '';
  editSourceUrl = '';


  constructor(private store: Store) {}

  selectSource(source: DisplaySource) {
    this.store.dispatch(new SetAllSourcesSelected(false));
    this.store.dispatch(new SetSourceIsLoading(true));
    this.store.dispatch(new SetSource(source));
  }

  selectAllSources(){
    this.store.dispatch(new SetAllSourcesSelected(true));
    this.store.dispatch(new SetSourceIsLoading(true));
    this.store.dispatch(new SetSource(null));
  }

  addNewSource() {
    var params = this.determineSourceParams();
    console.log('params: ' + params);
    console.log('platform: ' + this.newSourcePlatform);
    console.log('url: ' + this.newSourceName);
    this.store.dispatch(
      new AddNewSource(this.newSourceName, this.newSourcePlatform, params)
    );
    this.newSourceName = '';
    this.newSourceUrl = '';
    this.showAddSourcesModal = false;
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
        if (!url.includes('youtube')) {
          return {
            source_type: 'youtube',
            video_id: url,
          };
        }
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

  editSource(){

    const selectedSource = this.store.selectSnapshot(AppState.selectedSource);
    if(this.editSourceUrl != selectedSource?.params){
      this.newSourceName = this.editSourceName;
      this.newSourceUrl = this.editSourceUrl;
      this.newSourcePlatform = selectedSource?.url || '';

      if(this.newSourcePlatform.includes('youtube')){
        this.newSourcePlatform = 'youtube';
      }
      else if(this.newSourcePlatform.includes('tripadvisor')){
        this.newSourcePlatform = 'tripadvisor';
      }
      else if(this.newSourcePlatform.includes('google')){
        this.newSourcePlatform = 'googlereviews';
      }

      this.deleteSource();
      this.addNewSource();
      this.toggleEditSourceModal();
      return;
    }
    else if(this.editSourceName != selectedSource?.name){
      this.store.dispatch(new EditSource(this.editSourceName));
      this.toggleEditSourceModal();
      return;
    }
  }

  refreshSource() {
    this.store.dispatch(new RefreshSourceData());
  }

  deleteSource() {
    this.store.dispatch(new DeleteSource());
    this.showConfirmDeleteSourceModal = false;
  }

  selectPlatform(platform: string) {
    this.newSourcePlatform = platform;
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
      this.editSourceName = this.store.selectSnapshot(AppState.selectedSource)?.name || '';
      this.editSourceUrl = this.store.selectSnapshot(AppState.selectedSource)?.params || '';
      this.showEditSourceModal = true;
    } else {
      this.showEditSourceModal = false;
    }
  }

  toggleConfirmDeleteSourceModal() {
    if (!this.showConfirmDeleteSourceModal) {
      this.showConfirmDeleteSourceModal = true;
    } else {
      this.showConfirmDeleteSourceModal = false;
    }
  }
}
