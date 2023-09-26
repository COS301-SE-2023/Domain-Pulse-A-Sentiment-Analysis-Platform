import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AppState, DisplayDomain, DisplaySource } from '../app.state';
import { Observable, timeout, timer } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AddNewSource, DeleteSource, EditSource, GetSourceDashBoardInfo, GuestModalChange, RefreshSourceData, SetAllSourcesSelected, SetIsActive, SetSource, SetSourceIsLoading, ToastError, ToastSuccess, UplaodCVSFile } from '../app.actions';

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

  modalTimeout = false;

  lastOpenedModal: any[] = [];

  newSourceName = '';
  newSourcePlatform = '';
  newSourceUrl = '';
  newCSVFile: any = '';

  addSourceSpinner = false;

  editSourceName = '';
  editSourceUrl = '';

  isOpen = false;

  currHost = window.location.host;

  isEditing = false;
  canEdit: boolean = true;

  constructor(private store: Store, public el: ElementRef) {}

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

    this.store.select(AppState.canEdit).subscribe((canEdit: boolean) => {
      if (canEdit !== undefined) this.canEdit = canEdit;
    });
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


    this.addSourceSpinner = true;

    this.store.dispatch(
      new AddNewSource(this.newSourceName, this.newSourcePlatform, params)
    ).subscribe((res) => {
      if(this.newSourcePlatform == 'csv'){
        this.store.dispatch(new UplaodCVSFile(this.newCSVFile));
        this.newCSVFile = '';
        
      }

      
      timer(100).subscribe(() => {
        this.addSourceSpinner = false;
        this.newSourceName = '';
        this.newSourceUrl = '';
        this.showAddSourcesModal = false;

      });
      return;
    });
    
    /* this.newSourceName = '';
    this.newSourceUrl = '';
    this.showAddSourcesModal = false; */
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
        if (!url.includes('youtube') && !url.includes('youtu.be')) {
          return {
            source_type: 'youtube',
            video_id: url,
          };
        }
        console.log('url: ' + url);
        const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?&v=)([^#&?]+).*/;
        const match = url.match(regExp);
        console.log('match: ' + match);

        return {
          source_type: 'youtube',
          video_id:  match![1],
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

  editSourceNew(){

    if(this.editSourceName == ''){
      this.store.dispatch(new ToastError('Please enter a name for your source'));
      return;
    }

    if(this.editSourceName.length > 25){
      this.store.dispatch(new ToastError('Source name must be less than 25 characters'));
      return;
    }

    const selectedSource = this.store.selectSnapshot(AppState.selectedSource);
    if(this.editSourceName != selectedSource?.name){
      this.store.dispatch(new EditSource(this.editSourceName));
      this.isEditing = false;
      return;
    }
    else{
      this.isEditing = false;
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
    if(!this.canEdit){
      this.store.dispatch(new GuestModalChange(true));
      return
    }
    
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
    this.store.dispatch(new DeleteSource());
    this.showConfirmDeleteSourceModal = false;
  }

  selectPlatform(platform: string) {
    this.newSourcePlatform = platform;
  }

  toggleAddSourcesModal() {
    if(!this.canEdit){
      this.store.dispatch(new GuestModalChange(true));
      return
    }

    if (!this.showAddSourcesModal) {
      this.showAddSourcesModal = true;

      this.lastOpenedModal.push('addSourceModal');
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300);

    } else {
      this.showAddSourcesModal = false;

      this.lastOpenedModal.pop();
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300);
    }
  }

  toggleEditSourceModal() {
    if (!this.showEditSourceModal) {
      this.editSourceName = this.store.selectSnapshot(AppState.selectedSource)?.name || '';
      this.editSourceUrl = this.store.selectSnapshot(AppState.selectedSource)?.params || '';
      this.showEditSourceModal = true;

      /* this.lastOpenedModal.push('editSource');
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300); */
    } else {
      this.showEditSourceModal = false;
      /* this.lastOpenedModal.pop();
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300); */
    }
  }

  toggleConfirmDeleteSourceModal() {
    if(!this.canEdit){
      this.store.dispatch(new GuestModalChange(true));
      return
    }
    if(this.selectedSource == null){
      this.store.dispatch(new ToastError('You must select a specific source to delete'));
      return;
    }
    if (!this.showConfirmDeleteSourceModal) {
      this.showConfirmDeleteSourceModal = true;

      this.lastOpenedModal.push('confirmDeleteSourceModal');
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300);

    } else {
      this.showConfirmDeleteSourceModal = false;

      this.lastOpenedModal.pop();
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300);
    }
  }

  toggleInfoModal() {
    if (!this.showInfoModal) {
      this.showInfoModal = true;

      this.lastOpenedModal.push('infoModal');
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300);

    } else {
      this.isEditing = false;
      this.showInfoModal = false;

      this.lastOpenedModal.pop();
      this.modalTimeout = true;
      setTimeout(() => {
        this.modalTimeout = false;
      }, 300);

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

  getLiveReviewLink(): string {
    if (this.currHost == 'localhost:4200') {
      // the below should not be hardcoded
      return `http://localhost:8004/ingest/post-review/${this.selectedSource?.id}/${this.selectedSource?.name}`;
    } else {
      return `${window.location.protocol}//${this.currHost}/ingest/post-review/${this.selectedSource?.id}/${this.selectedSource?.name}`;
    }
  }

  editName(){
    this.editSourceName = this.store.selectSnapshot(AppState.selectedSource)?.name || '';
    this.isEditing = true;
  }

 /*  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    console.log('click');
    if(!this.modalTimeout){
      switch(this.lastOpenedModal[this.lastOpenedModal.length - 1]){
        case 'addSource':
          var modalDiv1 = this.el.nativeElement.querySelector('#addSourceModal');
          if (modalDiv1 && !modalDiv1.contains(event.target)) {
            if(this.showAddSourcesModal){
              this.toggleAddSourcesModal();
            }
          }
          break;
        case 'confirmDeleteSource':
          const modalDiv2 = this.el.nativeElement.querySelector('#confirmDeleteSourceModal');
          if (modalDiv2 && !modalDiv2.contains(event.target)) {
            if(this.showConfirmDeleteSourceModal){
              this.toggleConfirmDeleteSourceModal();
            }
          }
          break;
        case 'info':
          const modalDiv3 = this.el.nativeElement.querySelector('#infoModal');
          if (modalDiv3 && !modalDiv3.contains(event.target)) {
            if(this.showInfoModal){
              this.toggleInfoModal();
            }
          }

          break;

      }

    }
    
  } */

@HostListener('document:click', ['$event'])
onClick(event: MouseEvent) {
  if (!this.modalTimeout) {
    var modalDiv = this.getModalElement(this.lastOpenedModal[this.lastOpenedModal.length-1]); // Use a separate method
    if (!this.checkIfClickIn(event, modalDiv!)) {
      this.handleModalClick();
    }
  }
}

checkIfClickIn(event: MouseEvent, modalDiv: HTMLElement): boolean {
  if(!modalDiv) return false;
  var result =  modalDiv && modalDiv.contains(event.target as Node);
  return result;
}

public getModalElement(search: string): HTMLElement | null {
  return this.el.nativeElement.querySelector('#' + search );
}

public handleModalClick() {
  switch (this.lastOpenedModal[this.lastOpenedModal.length - 1]) {
    case 'addSourceModal':
      if (this.showAddSourcesModal) {
        this.toggleAddSourcesModal();
      }
      break;
    case 'confirmDeleteSourceModal':
      if (this.showConfirmDeleteSourceModal) {
        this.toggleConfirmDeleteSourceModal();
      }
      break;
    case 'infoModal':
      if (this.showInfoModal) {
        this.toggleInfoModal();
      }
      break;
  }
}

}
