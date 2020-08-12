import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class TagService {
	constructor(private http: HttpClient) {}

	getTagsByType(tagType) {
		return this.http.get(
			`http://ingenero-alb-87806539.us-east-2.elb.amazonaws.com/tags/type/${tagType}`
		);
	}
}
