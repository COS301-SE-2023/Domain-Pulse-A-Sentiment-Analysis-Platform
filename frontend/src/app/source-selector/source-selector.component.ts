import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppState, DisplayDomain, DisplaySource } from '../app.state';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AddNewSource, DeleteSource, EditSource, GetSourceDashBoardInfo, RefreshSourceData, SetAllSourcesSelected, SetIsActive, SetSource, SetSourceIsLoading, ToastError, ToastSuccess, UplaodCVSFile } from '../app.actions';

@Component({
  selector: 'source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.sass'],
})
export class SourceSelectorComponent implements OnInit {
  @Select(AppState.sources) sources$!: Observable<DisplaySource[] | null>;
  @Select(AppState.selectedSource)
  selectedSource$!: Observable<DisplaySource | undefined>;
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;
  @Select(AppState.allSourcesSelected) allSources$!: Observable<number>;
  selectedSource?: DisplaySource;

  showAddSourcesModal = false;
  showEditSourceModal = false;
  showConfirmDeleteSourceModal = false;
  showInfoModal = false;
  newSourceName = '';
  newSourcePlatform = '';
  newSourceUrl = '';
  newCSVFile: any = '';

  editSourceName = '';
  editSourceUrl = '';

  isOpen = false;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.selectedSource$.subscribe(source => {
      this.selectedSource = source;
    });

    const copyIcon = document.getElementById('copyIcon');
    if (copyIcon) {
      copyIcon.addEventListener('click', () => {
        this.copyToClipboard();
      });
    }
    
  }

  uploadFile(event: any) {
    this.newCSVFile = event.target.files[0];
    console.log('this.newCSVFile: ')
    console.log(this.newCSVFile)
  }

  copyToClipboard() {
    const liveReviewLink = document.getElementById('liveReviewLink');
    if (liveReviewLink) {
      const textToCopy = liveReviewLink.getAttribute('href')!;
      navigator.clipboard.writeText(textToCopy);
    }
  }

  selectSource(source: DisplaySource) {
    this.store.dispatch(new SetAllSourcesSelected(false));
    this.store.dispatch(new SetSourceIsLoading(true));
    this.store.dispatch(new SetSource(source));
    console.log('source: ' + source.id);
    console.log('source: ' + source.name);
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
    console.log('name: ' + this.newSourceName);

    if ((this.newSourcePlatform != 'livereview' && this.newSourcePlatform != 'csv') && this.newSourceUrl == '') {
      this.store.dispatch(new ToastError('Please add a URL'));
      return;
    }
    

    if (!params || !this.newSourcePlatform || !this.newSourceName) {
      this.store.dispatch(new ToastError('Please fill in all fields'));
      return;
    }

    if(this.newSourcePlatform == 'csv' && this.newCSVFile == ''){
      this.store.dispatch(new ToastError('Please upload a CSV file'));
      return;
    }

    if(this.newSourceName.length > 25){
      this.store.dispatch(new ToastError('Source name must be less than 25 characters'));
      return;
    }


    this.store.dispatch(
      new AddNewSource(this.newSourceName, this.newSourcePlatform, params)
    ).subscribe(() => {
      if(this.newSourcePlatform == 'csv'){
        this.store.dispatch(new UplaodCVSFile(this.newCSVFile));
        this.newCSVFile = '';
      }
    });
    
    this.newSourceName = '';
    this.newSourceUrl = '';
    this.showAddSourcesModal = false;
  }

  /* elif type_of_source.lower() == "livereview":
        if "is_active" not in params:
            return False, "Missing parameter: is_active"
        return True, "Source details are valid"
 */
  determineSourceParams(): any | null {
    switch (this.newSourcePlatform) {
      case 'csv':
        return {
          source_type: 'csv',
        };
      case 'trustpilot':
        const tpurl = this.newSourceUrl;
        if (!tpurl.includes('trustpilot')) {
          return {
            source_type: 'trustpilot',
            query_url: tpurl,
          };
        }

        const urlParts = tpurl.split('/');
        const indexOfReviews = urlParts.indexOf('review');
        const tpID = urlParts[indexOfReviews + 1];

        return {
          source_type: 'trustpilot',
          query_url: tpID,
        }
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
      case 'livereview':
        return {
          source_type: 'livereview',
          is_active: true,
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

      this.newSourcePlatform = this.determinePlatformFromNewSourcePlatform();

      this.deleteSource();
      this.addNewSource();
      this.toggleEditSourceModal();
      return;
    }
    else if(this.editSourceName != selectedSource?.name){
      // this.store.dispatch(new EditSource(this.editSourceName));
      // this.toggleEditSourceModal();
      return;
    }
  }

  determinePlatformFromNewSourcePlatform(): string {
    switch (this.newSourcePlatform) {
      case 'googlereviews':
        return 'googlereviews';
      case 'tripadvisor':
        return 'tripadvisor';
      case 'youtube':
        return 'YouTube';
      case 'livereview':
        return 'livereview';
      case 'trustpilot':
        return 'trustpilot';
    }
    return '';
  }

  refreshSource() {
    
    if(this.selectedSource == null){
      this.store.dispatch(new ToastError('You must select a specific source to refresh'));
      return;
    }
    else if(this.selectedSource?.url == 'csv-logo.png'){
      this.store.dispatch(new ToastError('CSV sources cannot be refreshed'));
      return;
    }
    this.store.dispatch(new RefreshSourceData());
  }

  deleteSource() {
    if(this.selectedSource == null){
      this.store.dispatch(new ToastError('You must select a specific source to delete'));
      return;
    }
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
    if(this.selectedSource == null){
      this.store.dispatch(new ToastError('You must select a specific source to delete'));
      return;
    }
    if (!this.showConfirmDeleteSourceModal) {
      this.showConfirmDeleteSourceModal = true;
    } else {
      this.showConfirmDeleteSourceModal = false;
    }
  }

  toggleInfoModal() {
    if (!this.showInfoModal) {
      this.showInfoModal = true;
    } else {
      this.showInfoModal = false;
    }
  }

  showInfo(event: Event): void {
    event.stopPropagation();
    this.toggleInfoModal();
  }

  toggleActive(event: any) {
    console.log('onValueChange', event);
    const selectedSource = this.store.selectSnapshot(AppState.selectedSource);
    
    this.store.dispatch(new SetIsActive(!selectedSource?.params));
  }
}
