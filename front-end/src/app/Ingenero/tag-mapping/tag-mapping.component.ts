import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfigurationService } from '../services/configuration/configuration.service';
@Component({
	selector: 'ig-tag-mapping',
	templateUrl: './tag-mapping.component.html',
	styleUrls: ['./tag-mapping.component.scss'],
})
export class TagMappingComponent implements OnInit {
	@ViewChild('paginator') paginator: MatPaginator;
	mappingForm: FormGroup;
	pageSize = 10;
	totalCount = 0;
	search: FormControl = new FormControl();
	mappingData: any[] = [];
	filteredData: any[] = [];
	@Input() event: Observable<void>;
	@Output() mapping: EventEmitter<any> = new EventEmitter();
	masterTags: { checked: boolean; value: number; label: string }[] = [
		{ checked: false, value: 1, label: 'Target Tags' },
		{ checked: false, value: 2, label: 'Performance Tags' },
		{ checked: false, value: 3, label: 'Match Tags' },
		{ checked: false, value: 4, label: 'Noise Tags' },
	];
	constructor(
		private fb: FormBuilder,
		private service: ConfigurationService
	) { }

	deSelect(event, el, name): void {
		event.preventDefault();
		const control = this.mappingForm.get(name.toString()) as FormControl;
		if (el.checked) {
			el.checked = false;
			control.patchValue(5);
		} else {
			el.checked = true;
			control.patchValue(el.value);
		}
	}

	ngOnInit(): void {
		this.mappingForm = this.fb.group({});
		this.getMappingData();
		this.listenForSubmit();
		this.search.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
			.subscribe((e) => {
				this.setPagination();
			});
	}

	filterMappings(text: string = '') {
		return this.mappingData.filter(({ desc }) =>
			desc.trim().toLowerCase().includes(text.trim().toLowerCase())
		);
	}

	setPagination() {
		const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
		const text = this.search.value;
		if (text) {
			const data = this.mappingData.filter(({ desc }) =>
				desc.trim().toLowerCase().includes(text.trim().toLowerCase())
			);
			this.totalCount = data.length;
			this.filteredData = data.slice(
				startIndex,
				this.paginator.pageSize + startIndex
			);
		} else {
			this.totalCount = this.mappingData.length;
			this.filteredData = this.mappingData.slice(
				startIndex,
				this.paginator.pageSize + startIndex
			);
		}
	}

	listenForSubmit(): void {
		this.event.subscribe(() => {
			this.buildMapping(this.mappingForm.value);
			this.service
				.updateMapping(this.buildMapping(this.mappingForm.value))
				.subscribe(() => {
					this.mapping.emit(true);
				});
		});
	}

	buildMapping(data: object): object {
		const group: { tagId: string; typeId: number }[] = [];
		for (const [tagId, typeId] of Object.entries(data)) {
			group.push({ tagId, typeId });
		}
		return group;
	}

	getMappingData(): void {
		this.service.getMappingForAllTags().subscribe((mappingData) => {
			this.mappingData = [...mappingData];
			this.filteredData = [...mappingData];
			this.setPagination();
			this.generateFormgroup();
		});
	}

	generateFormgroup(): void {
		this.mappingData.forEach((data) => {
			const control = new FormControl(data.type.id);
			(control as any).tag = data.type;
			this.mappingForm.addControl(data.id, control);
		});
	}
}
