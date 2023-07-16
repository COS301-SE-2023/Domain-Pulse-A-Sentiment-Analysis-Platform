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
  private engineBaseUrl = `http://${window.location.hostname}:8001/`;
  private getDomainsUrl = 'domains/get_domains/1';

  private _domains = new BehaviorSubject<Domain[]>([]);
  private _selectedDomain = new BehaviorSubject<Domain | null>(null);
  readonly domains$ = this._domains.asObservable();
  readonly selectedDomain$ = this._selectedDomain.asObservable();

  constructor(private http: HttpClient) {}

  addNewDomain(newDomainName: string, domain_image_name: string) {
    //add_domain/<user_id>/<domain_name>/<domain_image_name>

    const addDomainUrl = `${this.engineBaseUrl}domains/add_domain/1/${newDomainName}/${domain_image_name}`;
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
}
