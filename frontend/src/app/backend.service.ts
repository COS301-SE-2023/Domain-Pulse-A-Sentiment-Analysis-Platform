import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

interface Sources {
  source_id: number;
  source_name: string;
}

interface Domain {
  id: number;
  name: string;
  imageUrl: string;
  selected: boolean;
  sources: Sources[];
}

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private baseUrl = 'http://localhost:8000/';
  private getDomainsUrl = 'domains/get_domains/1';

  private _domains = new BehaviorSubject<Domain[]>([]);
  private _selectedDomain = new BehaviorSubject<Domain | null>(null);
  readonly domains$ = this._domains.asObservable();
  readonly selectedDomain$ = this._selectedDomain.asObservable();

  constructor(private http: HttpClient) {
    this.http.get(this.baseUrl + this.getDomainsUrl).subscribe((res: any) => {
      let firstt = true;
      let domainArr: Domain[] = res.domains.map((domain: any) => {
        let selected = false;
        if (firstt) {
          selected = true;
          this._selectedDomain.next({
            id: domain.domain_id,
            name: domain.domain_name,
            imageUrl: '../assets/' + domain.image_url,
            selected: selected,
            sources: domain.sources,
          });

          firstt = false;
        }
        return {
          id: domain.domain_id,
          name: domain.domain_name,
          imageUrl: '../assets/' + domain.image_url,
          selected: selected,
        };
      });

      console.log(res);
      console.log(domainArr);
      console.log(this._selectedDomain.value);

      this._domains.next(domainArr);
    });
  }

  addNewSource(sourceName: string) {
    console.log('addNewSource');
    console.log(sourceName);
    console.log(this._selectedDomain.value);
    console.log(this._selectedDomain.value?.id);
    console.log(this._selectedDomain.value?.sources);

    //add_source/<user_id>/<domain_id>/<source_name>

    if (this._selectedDomain.value) {
      let domainID = this._selectedDomain.value.id;
      const addSourceUrl =
        this.baseUrl + `domains/add_source/1/${domainID}/${sourceName}`;

      this._selectedDomain.value.sources.push({
        source_id: 0,
        source_name: sourceName,
      });

      this.http.get(addSourceUrl).subscribe();
    }
  }

  addNewDomain() {
    let newMockDomain: Domain = {
      id: 13,
      name: 'Formula 1',
      imageUrl: '../assets/f1-logo.png',
      selected: false,
      sources: [],
    };

    this._domains.value.push(newMockDomain);
  }
}
