import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiagramValuesService {
  url = 'assets/data';
  constructor(private http: HttpClient) { }

  getValues(): Observable<any> {
    return this.http.get(`${this.url}/diagramValues.json`);
  }
}
