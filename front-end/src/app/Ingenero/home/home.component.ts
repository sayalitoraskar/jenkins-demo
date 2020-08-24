import { Component, OnInit, OnDestroy } from '@angular/core';
import { TagService } from '../services/tag.service';
import { RootService } from '../services/root.service';
import { TagReadOnlyService } from '../services/tag-read-only.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, take, first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ConfigurationService } from '../services/configuration/configuration.service';
@Component({
	selector: 'ig-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	BenchMarkNotifySubject: Subject<void> = new Subject<void>();
	rightPanTagsNotifySubject: Subject<void> = new Subject<void>();
	headerNotifySubject: Subject<void> = new Subject<void>();
	tagCurrentData = [];
	tagHistoryData = [];
	allData=[];
	diagramTags = {
		viewValues: [],
		activePerformanceTag: ""
	}
	currentTimeStamp = {
		formatedtime: null,
		timestamp: null
	}
	historicTimeStamp = {
		formatedtime: null,
		timestamp: null
	}
	loadingCurrent = true;
	loadingHistory =true;
	constructor(private tagService: TagService, private rootService: RootService,
		private router: Router, private tagReadOnlyService: TagReadOnlyService,
		private config:ConfigurationService
	) { }


	ngOnInit(): void {
		if (localStorage.getItem('config')) {
			this.getTagsCurrentData();
			this.getTagsHistoryData();
		}
		else {
			this.router.navigateByUrl('config');
		}
	}
	getTagsCurrentData() {
		this.tagReadOnlyService.getAllTagCurrentValues().pipe(first()).subscribe(data => {
			this.tagCurrentData = data;
			this.loadingCurrent = false;
			this.rightPanTags('current');
			this.setCurrentTime();
		},
		err =>{
			this.loadingCurrent = false;
			this.rightPanTags('current');
			this.setCurrentTime('error');
			this.config.showErrorNotification("Failed to Fetch Current Data");
		})
		interval(60000*10).pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.tagReadOnlyService.getAllTagCurrentValues()
					.subscribe(data => {
						this.tagCurrentData = data;
						this.rightPanTags('current');
						this.setCurrentTime();
					},
					err =>{
						this.rightPanTags('current');
						this.setCurrentTime('error');
						this.config.showErrorNotification("Failed to Fetch Current Data");
					});
			}); // only fires when component is alive
	}
	getTagsHistoryData() {
		this.tagReadOnlyService.getAllTagHistoryValues().pipe(first()).subscribe(data => {
			this.tagHistoryData = data;
			this.loadingHistory = false;
			this.rightPanTags('history');
			this.setHistoryTime();
		},
		err =>{
			this.loadingHistory = false;
			this.rightPanTags('history');
			this.setHistoryTime('error');
			this.config.showErrorNotification("Failed to Fetch History Data");
			console.log('No Histroy Data');
		})
		interval(60000*30).pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.tagReadOnlyService.getAllTagHistoryValues()
					.subscribe(data => {
						this.tagHistoryData = data;
						this.rightPanTags('history');
						this.setHistoryTime();
					},
					err =>{
						this.loadingHistory = false;
						this.rightPanTags('history');
						this.setHistoryTime('error');
						this.config.showErrorNotification("Failed to Fetch History Data");
						console.log('No Histroy Data');
					});
			});
	}
	setDiagramValues() {
		this.diagramTags.viewValues =[];
		this.rootService.getDiagramValues().subscribe(data => {
			data.result.forEach(viewtag => {
				this.diagramTags.viewValues.push(this.allData.find((key) => {
					if (key.tag.name === viewtag.name) {
						return key
					}
				}))
			})
			this.diagramTags.activePerformanceTag = JSON.parse(localStorage.getItem('config'))[0].performanceTags[0].tag.name;
		})		
	}
	setHistoryTime(error?) {
		if(!error){
			this.historicTimeStamp.formatedtime = this.tagHistoryData[0].aggregateLoadTime;
			this.historicTimeStamp.timestamp = this.tagHistoryData[0].aggregateLoadTimeInTimestamp;
		}
		else {
			this.historicTimeStamp.formatedtime = "";
			this.historicTimeStamp.timestamp = "";
		}
		this.rightPanTagsNotifySubject.next();
	}
	setCurrentTime(error?) {
		if(!error){
			this.currentTimeStamp.formatedtime = this.tagCurrentData[0].aggregateLoadTime;
			this.currentTimeStamp.timestamp = this.tagCurrentData[0].aggregateLoadTimeInTimestamp;
		}
		else{
			this.currentTimeStamp.formatedtime = "";
			this.currentTimeStamp.timestamp = "";
		}
		this.headerNotifySubject.next();
	}
	rightPanTags(type){		
		if(type === 'current' && this.tagCurrentData.length > 0){
			this.allData=[];
			this.tagCurrentData.forEach(key =>{
				this.allData.push({
					id:key.id,
					current:{
						value:key.value,
						aggregateLoadTime:key.aggregateLoadTime,
						aggregateLoadTimeInTimestamp:key.aggregateLoadTimeInTimestamp,
						duration:key.duration
					},
					result:{},
					tag:key.tag
				})
			})
			this.allData.forEach(data =>{
				this.tagHistoryData.forEach(key =>{
					if(key.tag.id === data.tag.id) {
						let obj ={
							value:key.value,
							aggregateLoadTime:key.aggregateLoadTime,
							aggregateLoadTimeInTimestamp:key.aggregateLoadTimeInTimestamp,
							duration:key.duration
						}
						data.result = obj;
					}				
				})
			})
			this.setDiagramValues();			
		}
		else if(type === 'history' && this.tagHistoryData.length > 0){
			this.allData=[];
			this.tagHistoryData.forEach(key =>{
				this.allData.push({
					id:key.id,
					result:{
						value:key.value,
						aggregateLoadTime:key.aggregateLoadTime,
						aggregateLoadTimeInTimestamp:key.aggregateLoadTimeInTimestamp,
						duration:key.duration
					},
					current:{},
					tag:key.tag
				})
			})
			this.allData.forEach(data =>{
				this.tagCurrentData.forEach(key =>{
					if(key.tag.id === data.tag.id) {
						let obj ={
							value:key.value,
							aggregateLoadTime:key.aggregateLoadTime,
							aggregateLoadTimeInTimestamp:key.aggregateLoadTimeInTimestamp,
							duration:key.duration
						}
						data.current = obj;
					}				
				})
			})
			this.setDiagramValues();
		}
		if(!this.loadingCurrent && !this.loadingHistory){
			this.rightPanTagsNotifySubject.next();
			this.BenchMarkNotifySubject.next();
		}
	}
	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
