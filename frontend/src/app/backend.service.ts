import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface Sources {
  source_id: number;
  source_name: string;
  source_image_name: string;
}

export interface Domain {
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
          sources: domain.sources,
          selected: selected,
        };
      });

      console.log(res);
      console.log(domainArr);
      console.log(this._selectedDomain.value);

      this._domains.next(domainArr);
    });
  }

  addNewSource(sourceName: string, newSourcePlatform: string) {
    let source_image_name = '';
    console.log(newSourcePlatform);
    switch (newSourcePlatform) {
      case 'facebook':
        source_image_name = 'facebook-logo.png';
        break;
      case 'instagram':
        source_image_name = 'instagram-Icon.png';
        break;
      case 'reddit':
        source_image_name = 'reddit-logo.png';
        break;
    }

    console.log('addNewSource');
    console.log(sourceName);
    console.log(this._selectedDomain.value);
    console.log(this._selectedDomain.value?.id);
    console.log(this._selectedDomain.value?.sources);

    //add_source/<user_id>/<domain_id>/<source_name>

    if (this._selectedDomain.value) {
      let domainID = this._selectedDomain.value.id;
      const addSourceUrl =
        this.baseUrl +
        `domains/add_source/1/${domainID}/${sourceName}/${source_image_name}`;

      this._selectedDomain.value.sources.push({
        source_id: 0,
        source_name: sourceName,
        source_image_name: source_image_name,
      });

      this.http.get(addSourceUrl).subscribe();
    }
  }

  addNewDomain(newDomainName: string, domain_image_name: string) {
    //add_domain/<user_id>/<domain_name>/<domain_image_name>

    const addDomainUrl = `${this.baseUrl}domains/add_domain/1/${newDomainName}/${domain_image_name}`;
    this.http.get(addDomainUrl).subscribe((data: any) => {
      let domains = data.domains;
      const domainsSize = domains.length;
      let newDomain = domains[domainsSize - 1];

      let domain: Domain = {
        id: newDomain.domain_id + 1,
        name: newDomain.domain_name,
        imageUrl: '../assets/' + newDomain.image_url,
        selected: false,
        sources: [],
      };

      this._domains.value.push(domain);
    });
  }

  selectDomain(domain: Domain) {
    for (let i = 0; i < this._domains.value.length; i++) {
      this._domains.value[i].selected = false;
      if (this._domains.value[i].id === domain.id) {
        this._selectedDomain.next(this._domains.value[i]);
        this._domains.value[i].selected = true;
      }
    }
  }
}
