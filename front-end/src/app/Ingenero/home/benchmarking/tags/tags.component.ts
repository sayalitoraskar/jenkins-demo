import { Component, OnInit, Input, HostListener, ViewChild } from '@angular/core';
import { RootService } from 'src/app/Ingenero/services/root.service';
import { TagReadOnlyService } from 'src/app/Ingenero/services/tag-read-only.service';
import { Observable } from 'rxjs';
import * as moment from 'moment';
@Component({
  selector: 'ig-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  @Input() allData: any[];
  @Input() viewTime;
  @Input() event: Observable<void>;
  selectedFilter = "All";
  chartAllTags = [];
  viewDate = "";
  viewMinutes = "";
  filterData = [];
  configTarget = [];
  configPerformance = [];
  targetTags = [];
  filteredResultTag=[];
  performanceTags = [];
  firstColorValue = {
    checked : true,
    value:"All"
  }
  allColors = [{
    checked: true,
    value: "Red",
    code:"#FF0000"
  }, {
    checked: true,
    value: "Yellow",
    code:"#FFFF00" // change to #FFFF00 when color coding data is present in database
  }, {
    checked: true,
    value: "Green",
    code:"#008000"
  }  , {
    checked: true,
    value: "Black",
    code:"#000"
  }];
  resultTags = [];
  @ViewChild('filterMenuTrigger') menu: any;
  constructor(private rootService: RootService, private tagReadOnlyService: TagReadOnlyService) { }

  ngOnInit(): void {
    this.event.subscribe(data => {
      setTimeout(() => {
        if (this.allData.length > 0) {
          this.configTarget = JSON.parse(localStorage.getItem('config'))[0].targetTags;
          this.configPerformance = JSON.parse(localStorage.getItem('config'))[0].performanceTags;
          this.setupTags();
          this.setFilterData();
          this.setTime();
        }
      }, 500)
    })
  }
  openChart(id) {
    this.chartAllTags = [];
    this.allData.forEach(key => {
      this.chartAllTags.push({
        name: key.tag.name,
        desc: key.tag.desc,
        id: key.tag.id
      })
    })
    this.rootService.openChart({
      tag: id,
      allTags: this.chartAllTags,
      flag: true
    });
  }
  setupTags() {
    this.targetTags = [];
    this.performanceTags = [];
    this.configTarget.forEach(data => {
      let found = 0;
      this.allData.find((key) => {
        if (key.tag.name === data.tag.name) {
          found = 1;
          this.targetTags.push({
            id: key.tag.id,
            actualvalue: (Object.keys(key.current).length !== 0) ? (key.current.value).toFixed(2) : "-",
            targetValue: (data.target).toFixed(2),
            name: key.tag.name,
            desc: key.tag.desc,
            uom: (Object.keys(key.current).length !== 0) ? key.tag.uom : "",
            difference: null,
            formula: key.tag.deviationFormula,
            time: (Object.keys(key.current).length !== 0) ? key.current.aggregateLoadTimeInTimestamp : "-",
            activeColor: (Object.keys(key.current).length !== 0) ?
              this.getActiveColor(key.tag.tagRangeColorMappings, key.current.value, 1) : "#000"
          })
        }
      })
      if (found === 0) {
        this.targetTags.push({
          id: data.tag.id,
          actualvalue: "-",
          targetValue: (data.target).toFixed(2),
          name: data.tag.name,
          desc: data.tag.desc,
          uom: "",
          difference: null,
          formula: data.tag.deviationFormula,
          time: "-",
          activeColor: "#000"
        })
      }
    })

    this.configPerformance.forEach(data => {
      let found = 0;
      this.allData.find((key) => {
        if (key.tag.name === data.tag.name) {
          found = 1;
          this.performanceTags.push({
            id: key.tag.id,
            currentValue: (Object.keys(key.current).length !== 0) ? (key.current.value).toFixed(2) : "-",
            historicBest: (Object.keys(key.result).length !== 0) ? (key.result.value).toFixed(2) : "-",
            name: key.tag.name,
            desc: key.tag.desc,
            uom: key.tag.uom,
            potential: (Object.keys(key.current).length !== 0 && Object.keys(key.result).length !== 0) ?
              this.calculatePotential(key.current.value, key.result.value) : "-",
            formula: key.tag.deviationFormula,
            time: (Object.keys(key.current).length !== 0) ? key.current.aggregateLoadTimeInTimestamp : "-",
            activeColor: (Object.keys(key.current).length !== 0 && Object.keys(key.result).length !== 0) ?
              this.getActiveColor(key.tag.tagRangeColorMappings, this.calculatePotential(key.current.value, key.result.value)
                , 2) : "#000"
          })
        }
      })
      if (found === 0) {
        this.performanceTags.push({
          id: data.tag.id,
          currentValue: "-",
          historicBest: "-",
          name: data.tag.name,
          desc: data.tag.desc,
          uom: "",
          potential: "-",
          formula: data.tag.deviationFormula,
          time: "",
          activeColor: "#000"
        })
      }
    })
  }
  calculatePotential(current, history) {
    return ((history - current)).toFixed(2);
  }
  calculateDeviation(current, history, formula) {
    let result;
    if (formula) {
      if (formula === "abs(HV-CV)*100/HV") {
        result = (((Math.abs(history - current)) * 100) / history).toFixed(2);
      }
      else if (formula === "abs(HV-CV)") {
        result = (Math.abs(history - current)).toFixed(2)
      }
    }
    else {
      result = (((Math.abs(history - current)) * 100) / history).toFixed(2);
    }
    return result;
  }
  setFilterData() {
    this.rootService.getFilterData().subscribe(data => {
      this.filterData = data.filters;
      this.setResultTags();
    })
  }
  onFilterChange(value) {
    this.selectedFilter = value;
    this.setResultTags();
  }
  setResultTags() {
    this.resultTags = [];
    this.filterData.forEach(filter => {
      if (this.selectedFilter === filter.name) {
        filter.data.forEach(tag => {
          let found = 0;
          this.allData.find((key) => {
            if (key.tag.name === tag.tagName) {
              found = 1;
              this.resultTags.push({
                id: key.tag.id,
                currentValue: (Object.keys(key.current).length !== 0) ? (key.current.value).toFixed(2) : "-",
                historicBest: (Object.keys(key.result).length !== 0) ? (key.result.value).toFixed(2) : "-",
                name: key.tag.name,
                desc: key.tag.desc,
                uom: key.tag.uom,
                deviation: (Object.keys(key.current).length !== 0 && Object.keys(key.result).length !== 0) ?
                  this.calculateDeviation(key.current.value, key.result.value, key.tag.deviationFormula) : "-",
                formula: key.tag.deviationFormula,
                time: (Object.keys(key.current).length !== 0) ? key.current.aggregateLoadTimeInTimestamp : "-",
                activeColor: (Object.keys(key.current).length !== 0 && Object.keys(key.result).length !== 0) ?
                  this.getActiveColor(key.tag.tagRangeColorMappings, this.calculateDeviation(key.current.value, key.result.value, key.tag.deviationFormula)
                    , 6) : "#000"
              })
            }
          })
          if (found === 0) {
            this.resultTags.push({
              id: "",
              currentValue: "-",
              historicBest: "-",
              name: tag.tagName,
              desc: tag.tagName,
              uom: "",
              deviation: "-",
              formula: "-",
              time: "-",
              activeColor: "#000"
            })
          }
          this.filteredResultTag = this.resultTags;
        })
      }
    })
  }
  setTime() {
    if(this.viewTime.timestamp !== ''){
      let obj:any = moment(parseInt(this.viewTime.timestamp));
      this.viewDate = obj.tz('America/Denver').format('MM-DD-YYYY');
      let min:any = moment(parseInt(this.viewTime.timestamp))
      this.viewMinutes=min.tz('America/Denver').format('hh:mm A');
    }
    else{
      this.viewDate = "";
      this.viewMinutes =""
    }
  }
  submitColor() {
    let filteredArr =[];
    this.allColors.forEach(color =>{
      if(color.checked){
        this.resultTags.forEach(tag =>{
          if(tag.activeColor === color.code){
            filteredArr.push(tag);
          }
        })
      }
    })
    this.filteredResultTag =filteredArr;
    this.menu.closeMenu();
  }
  selectAll(event, color) {
    if (color === "All") {
      this.allColors.forEach((key) => {
        if (event.checked) key.checked = true;
        else key.checked = false;
      })
    }
    else {
      this.firstColorValue.checked = false;
    }
  }
  getActiveColor(colorData, value, type) {
    let resultColor = "#000";
    const typeColorData = colorData.filter(key => key.typeId === type);
    typeColorData.forEach(data => {
      if (value > data.rangeStart && value < data.rangeEnd) {
        resultColor = data.color;
      }
    })
    return resultColor;
  }
  // @HostListener("document:click", ["$event.target"])
  // onClick(targetElement) {
  //   if (targetElement.classList.contains("color-overlay")) {
  //     this.showColors = false;
  //   }
  // }
}
