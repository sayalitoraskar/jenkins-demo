import { Component, OnInit, ViewChild } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MasterTags, Tag } from '../models';
import { ConfigurationService } from '../services/configuration/configuration.service';
import { RootService } from '../services/root.service';
@Component({
	selector: 'ig-configuration',
	templateUrl: './configuration.component.html',
	styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {
	@ViewChild('tabGroup') tabGroup;
	notifySubject: Subject<void> = new Subject<void>();
	columns: MasterTags = {
		[Tag.Target]: [
			'Min',
			'Target',
			'Max',
			{ tag: 'Active', selectAll: false },
		],
		[Tag.Match]: [
			'Offset % min',
			'Offset % max',
			{ tag: 'Active', selectAll: false },
		],
		[Tag.Noise]: ['Min', 'Max', { tag: 'Active', selectAll: false }],
	};
	performanceData: any[] = [];
	configuration: MasterTags;
	config: FormGroup;
	performanceDropdown: { value: number; label: string }[] = [
		{ value: 0, label: 'Minimize' },
		{ value: 1, label: 'Maximize' },
	];
	constructor(
		private fb: FormBuilder,
		private router: Router,
		private service: ConfigurationService,
		private rootService: RootService
	) { }

	ngOnInit(): void {
		this.getConfigurationData();
		this.getPerformanceData();
	}

	getConfigurationData(): void {
		this.service
			.getConfigurationForAllTags()
			.subscribe((tagData: MasterTags) => {
				this.configuration = tagData;
				this.config = this.createFormGroup(this.configuration);
				this.setSelectAll();
			});
	}

	getPerformanceData(): void {
		this.service.getPerformanceData().subscribe((performanceTagList) => {
			this.performanceData = performanceTagList;
		});
	}

	createFormGroup(configuration): FormGroup {
		const parentTagGroup = this.fb.group({});
		for (const [key, value] of Object.entries(configuration)) {
			if (key !== Tag.Performance) {
				parentTagGroup.addControl(key, this.addParentTags(value));
			} else {
				parentTagGroup.addControl(
					key,
					this.setPerformanceControl(value)
				);
			}
		}
		return parentTagGroup;
	}

	setPerformanceControl(controls): FormGroup {
		const childControls = this.fb.group({});
		const { tag } = controls[0];
		const control = new FormControl(tag.desc);
		childControls.addControl(tag.desc, control);
		return childControls;
	}

	addParentTags(controls): FormGroup {
		// Target , Performance , Match , Noise
		const childControls = this.fb.group({});
		controls.forEach((control) => {
			const { tag } = control;
			childControls.addControl(tag.id, this.addControls(control));
		});
		return childControls;
	}

	addControls(schema): FormGroup {
		// controls such as min,max,target etc.
		const child = this.fb.group({});
		for (const [key, value] of Object.entries(schema)) {
			if (typeof value !== 'object') {
				const control = new FormControl(value);
				const {tag: { validations },} = schema;
				if (validations.length) {
					const validationArray = validations.filter((item) =>
						item.hasOwnProperty(key)
					);
					const [validator] = validationArray;
					control.setValidators(
						this.setCustomValidator(validator, key)
					);
				}
				child.addControl(key, control);
			}
		}
		child.markAllAsTouched();
		return child;
	}

	setCustomValidator(validations, key): ValidatorFn {
		return (control: AbstractControl): { [key: string]: boolean } | null => {
			if (validations && validations[key].length) {
				for (const element of validations[key]) {
					if (control.value < element.value) {
						(control as any).validationMsg = `Value should be greater than ${element.value}`;
						return { overLimit: true };
					}
				}
			} else {
				return null;
			}
		};
	}

	selectAll(
		e,
		parentFormGroupName: string,
		checkboxControlName: string
	): void {
		const isChecked: boolean = e.checked;
		const controls = Object.values(
			(this.config.get(parentFormGroupName) as FormGroup).controls
		);
		controls.forEach((control) => {
			const selectedCheckboxControl = (control as FormGroup).get(
				checkboxControlName
			);
			selectedCheckboxControl.patchValue(isChecked);
		});
	}

	setSelectAll(): void {
		for (const [key, tag] of Object.entries(this.columns)) {
			const isParentChecked = tag[(tag as []).length - 1];
			const parent = this.config.get(key) as FormGroup;
			const checkbox = [];
			for (const [name, child] of Object.entries(parent.controls)) {
				const checkboxControl = (child as FormGroup).get('isActive');
				checkbox.push(checkboxControl.value);
			}
			checkbox.length === 0
				? (isParentChecked.selectAll = false)
				: (isParentChecked.selectAll = checkbox.every(
					(value) => value === true
				));
		}
	}
	buttonClick(action): void {
		if (action === 'submit') {
			this.tabGroup.selectedIndex === 4
				? this.notifySubject.next()
				: this.saveData();
		}
		if (action === 'home') {
			this.router.navigateByUrl('');
		}
		if (action === 'mapping') {
			this.tabGroup.selectedIndex = 4;
		}
	}

	updatePerformanceData(event): void {
		const [selectedPerformanceTag] = this.performanceData.filter(
			(data: any) => data.desc === event.value
		);
		if (selectedPerformanceTag) {
			const { id, desc, name } = selectedPerformanceTag as any;
			const [performancetag] = this.configuration[Tag.Performance];
			performancetag.tag.id = id;
			performancetag.tag.name = name;
			performancetag.tag.desc = desc;
		}
	}

	getMappings(mapping): void {
		if (mapping) {
			this.getConfigurationData();
			this.getPerformanceData();
			this.service.showSuccessNotification('Mapping saved !!');
			this.tabGroup.selectedIndex = 0;
		}
	}

	saveData(): void {
		this.service.saveData(this.configuration).subscribe((data) => {
			this.service.showSuccessNotification('Configuration saved !!');
			this.rootService.setConfiguration(data.targetTags,data.performanceTags);
			this.router.navigateByUrl('');
		});
	}

	resetToDefault(): void {
		const activeTab = this.tabGroup.selectedIndex;
		const parent = { 1: Tag.Target, 2: Tag.Match, 3: Tag.Noise };
		this.service.resetToDefault().subscribe((data) => {
			const obj = {};
			for (const item of data) {
				const { tagId, tagField, defaultValue } = item;
				if (obj.hasOwnProperty(tagId)) {
					obj[tagId] = { [tagField]: defaultValue, ...obj[tagId] };
				} else {
					obj[tagId] = { [tagField]: defaultValue };
				}
			}
			this.config.get(parent[activeTab]).patchValue(obj);
			this.config.updateValueAndValidity();
			this.service.showSuccessNotification('Reset Completed !!');
		});
	}
}
