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
}
