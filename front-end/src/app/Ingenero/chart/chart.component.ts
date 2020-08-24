import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { RootService } from '../services/root.service';
import * as Highcharts from 'highcharts';
import { trigger, style, state, transition, animate } from '@angular/animations';
import { ExportCsvService } from '../services/export-csv.service';
import * as moment from 'moment-timezone';
import { ChartService } from '../services/chart.service';
interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'ig-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  animations: [
    trigger('AfterOpenAllChart', [
      state('open', style({ height: 'calc(625px - 325px)' })),
      state('close', style({ height: '0px' })),
      transition('open <=> close', animate('100ms ease-in'))
    ])
  ]
})
export class ChartComponent implements OnInit {
  state: string = 'close';
  @Input() tagId;
  @Input() allCharts;
  allChartWidth = 230;
  allChartHeight = 180;
  activeChartHeight = null;
  first = {
    min: null,
    max: null
  }
  second = {
    min: null,
    max: null
  }
  third = {
    min: null,
    max: null
  }
  fourth = {
    min: null,
    max: null
  }
  Highcharts: typeof Highcharts = Highcharts;
  updateFromInputMain = false;
  updateFromInputAll = false;
  allChartView = [];
  compareView = false;
  filterArray = ['1 Day', '7 Days', '30 Days', '3 Months', '1 Year'];
  chartTrendClass = "chart-wrapper-without-All";
  loading = true;
  allViewLoading = true;
  secondaryAxes = false;
  thirdAxis = false;
  fourthAxis = false;
  editSecond = false;
  editFirst = false;
  editThird = false;
  editFourth = false;
  activeSeries = [];
  activeFilter = "7 Days";
  activeChartData = [23, 32, 11, 32, 10, 2476, 221, 2, 54, 114, 57];
  colorArr = ["#000", "#42a2ff", "#7aff60", "#eb5a80"];
  activeChart = {};
  view = false;

  jsonData = [
    {
      name: "Anil Singh",
      age: 33,
      average: 98,
      approved: true,
      description: "I am active blogger and Author."
    },
    {
      name: 'Reena Singh',
      age: 28,
      average: 99,
      approved: true,
      description: "I am active HR."
    },
    {
      name: 'Aradhya',
      age: 4,
      average: 99,
      approved: true,
      description: "I am engle."
    },
  ];
  constructor(private rootService: RootService, private exportService: ExportCsvService,
    private charService: ChartService) { }

  ngOnInit(): void {
    this.setActiveChart();
  }
  setActiveChartSize(){
    this.activeChartHeight = (document.getElementById('activeSize').offsetHeight - 40);
    this.activeChart['chartData']['chart']['height'] =  this.activeChartHeight;
    this.updateFromInputMain =true;
  }
  setActiveChart() {
    this.charService.getChartData(this.tagId).subscribe(data => {
    console.log("ChartComponent -> setActiveChart -> data", data)
      let yaxisObj = {}
      this.activeSeries = this.setSeriesData(data.history);
      if (data.yAxis.min === 0 && data.yAxis.max === 0) {
        yaxisObj = { min: null, max: null };
      }
      else {
        yaxisObj = data.yAxis;
      }
      this.activeChart = {
        id: [{
          id: data.id
        }],
        tagName: [{
          name: data.desc,
          color: "#000"
        }],
        tagYAxis: this.activeSeries,
        chartData: this.primarySingleChartData(this.activeSeries, data.desc, data.uom, yaxisObj),
        tooltipUnit: data.uom,
        history: data.history,
        yaxis: yaxisObj,
        compare: false
      }

      this.setYaxis(yaxisObj);
      this.setActiveChartSize();
      setTimeout(() => {
        this.loading = false;
      }, 500)
    })
  }
  getChartById(id) {
    this.tagId = id;
    this.charService.getChartData(id).subscribe(data => {
      let yaxisObj = {}
      if (data.yAxis.min === 0 && data.yAxis.max === 0) {
        yaxisObj = { min: null, max: null };
      }
      else {
        yaxisObj = data.yAxis;
      }
      let obj = {
        id: data.id,
        tagName: data.desc,
        tagYAxis: this.setSeriesData(data.history),
        tooltipUnit: data.uom,
        chartData: {},
        history: data.history,
        yaxis: yaxisObj,
        compare: false
      }
      data.chartData = this.secondaryChartData(obj.tagYAxis, obj.tagName, obj.tooltipUnit);
      this.allChartView.push(obj);
      this.MoveChart(this.allChartView.length - 1);
    })
  }
  filterSelected(active) {
    this.activeFilter = active;
    this.loading = true;
    if (this.activeChart['id'].length === 1) {
      this.activeChart['tagYAxis'] = this.setSeriesData(this.activeChart['history']);
      this.activeChart['chartData'] = this.primarySingleChartData(
        this.activeChart['tagYAxis'],
        this.activeChart['tagName'][0].name,
        this.activeChart['tooltipUnit'],
        this.activeChart['yaxis']
      )
      this.updateFromInputMain = true;
      this.loading = false;
      this.allChartView.forEach(data => {
        data.tagYAxis = this.setSeriesData(data.history);
      })
    }
    else {
      this.activeChart['tagYAxis'] = this.setSeriesData(this.activeChart['history']);
      this.allChartView.forEach(data => {
        data.tagYAxis = this.setSeriesData(data.history);
      })
      let dualSeries = this.getDualSeries();
      this.activeChart['chartData'] = this.primaryDualChartData(dualSeries);
      this.updateFromInputMain = true;
      this.loading = false;
    }
  }
  closeChart() {
    this.rootService.openChart({
      tag: this.tagId,
      allTags: [],
      flag: false
    });
  }
  onTagAdd(Value) {
    let deleteIndex;
    this.allCharts.forEach((data, randomIndex) => {
      if (data.id === Value) {
        deleteIndex = randomIndex;
        this.loading = true;
        this.getChartById(data.id);
      }
    })
    this.allCharts.splice(deleteIndex, 1);
  }
  MoveChart(index) {
    if (!this.compareView) {
      if (this.activeChart['tagName'].length > 1) {
        this.activeChart['tagName'] = this.activeChart['tagName'].slice(0, 1);
        this.activeChart['id'] = this.activeChart['id'].slice(0, 1);
      }
      this.tagId = this.allChartView[index].id;
      let tempId = this.activeChart['id'][0].id;
      let tempData = this.activeChart['tagYAxis'];
      const tempName = this.activeChart['tagName'][0].name;
      let tempUnit = this.activeChart['tooltipUnit'];
      let tempHistory = this.activeChart['history'];
      let tempAxis = this.activeChart['yaxis'];
      let tempChartData = this.secondaryChartData(tempData, tempName, tempUnit);
      this.loading = true;
      this.state = 'close';
      this.activeChart['id'][0].id = this.allChartView[index].id;
      this.activeChart['tagName'][0].name = this.allChartView[index].tagName;
      this.activeChart['tagYAxis'] = this.allChartView[index].tagYAxis;
      this.activeChart['tooltipUnit'] = this.allChartView[index].tooltipUnit;
      this.activeChart['history'] = this.allChartView[index].history;
      this.activeChart['yaxis'] = this.allChartView[index].yaxis;
      this.activeChart['chartData'] = this.primarySingleChartData(
        this.allChartView[index].tagYAxis,
        this.allChartView[index].tagName,
        this.allChartView[index].tooltipUnit,
        this.allChartView[index].yaxis
      );
      this.setYaxis(this.allChartView[index].yaxis)
      this.allChartView.splice(index, 1);
      setTimeout(() => {
        this.allChartView.push({
          id: tempId,
          tagName: tempName,
          tagYAxis: tempData,
          chartData: tempChartData,
          tooltipUnit: tempUnit,
          history: tempHistory,
          yaxis: tempAxis,
          compare: false
        })
        this.secondaryAxes = false;
        this.thirdAxis = false;
        this.fourthAxis = false;
        this.editFirst = false;
        this.editSecond = false;
        this.editThird = false;
        this.editFourth = false;
        this.loading = false;
      }, 500)
    }
  }
  compareChart(chartIndex) {
    this.loading = true;
    this.state = "close";
    if (this.activeChart['id'].length < 4) {
      this.activeChart['id'].push({
        id: this.allChartView[chartIndex].id
      })
      this.activeChart['tagName'].push({
        name: this.allChartView[chartIndex].tagName,
        color: this.colorArr[(this.activeChart['id'].length) - 1]
      });
      let dualSeries = this.getDualSeries();
      this.activeChart['chartData'] = this.primaryDualChartData(dualSeries);
      let index = this.activeChart['id'].length - 1;
      this.setYaxis(this.activeChart['yaxis'], this.allChartView[chartIndex].yaxis, index);
    }
    setTimeout(() => {
      if (this.activeChart['id'].length === 2) {
        this.secondaryAxes = true;
        this.thirdAxis = this.fourthAxis = false;
      }
      if (this.activeChart['id'].length === 3) {
        this.secondaryAxes = true;
        this.thirdAxis = true;
      }
      if (this.activeChart['id'].length === 4) {
        this.secondaryAxes = true;
        this.fourthAxis = true;
      }
      this.editFirst = false;
      this.editSecond = false;
      this.editThird = false;
      this.editFourth = false;
      this.loading = false;
    }, 500)
  }
  allChartSize() {
    this.allViewLoading = true;
    setTimeout(() => {
      this.allChartHeight = (document.getElementById('allChart').offsetHeight - 60);
      this.allChartView.forEach(data => {
        data.chartData['chart']['height'] = this.allChartHeight;
        data.compare = true;
      });
      this.allViewLoading = false;
    }, 500)
  }
  openAllChart() {
    this.state = (this.state === 'open') ? 'close' : 'open';
    this.allChartSize();
  }
  editYAxes(type) {
    if (type === 'first') {
      this.editFirst = true;
      this.editSecond = this.editThird = this.editFourth = false;
    }
    else if (type === 'second') {
      this.editSecond = true;
      this.editFirst = this.editThird = this.editFourth = false;
    }
    else if (type === 'third') {
      this.editThird = true;
      this.editFirst = this.editSecond = this.editFourth = false;
    }
    else if (type === 'fourth') {
      this.editFourth = true;
      this.editFirst = this.editSecond = this.editThird = false;
    }
  }
  submitYAxis(type) {
    if (type === 'first') {
      this.editFirst = this.axisSubmitFunc(this.first, 0, 'first');
    }
    else if (type === 'second') {
      this.editSecond = this.axisSubmitFunc(this.second, 1, 'second');
    }
    else if (type === 'third') {
      this.editThird = this.axisSubmitFunc(this.third, 2, 'third');
    }
    else if (type === 'fourth') {
      this.editFourth = this.axisSubmitFunc(this.fourth, 3, 'fourth');
    }
  }
  axisSubmitFunc(value, index, type) {
    if (!(value.min === 0 && value.max === 0)) {
      this.activeChart['chartData']['yAxis'][index]['min'] = value.min;
      this.activeChart['chartData']['yAxis'][index]['max'] = value.max;
      this.updateYAxis(type);
      let obj = {
        tagId: this.activeChart['id'][index].id,
        min: parseInt(value.min),
        max: parseInt(value.max)
      }
      this.charService.updateAxis(obj).subscribe(data => {
        this.updateFromInputMain = true;
        return false;
      })
    }
    else {
      return false;
    }
  }
  secondaryChartData(data, tagName, unit) {
    let obj = {
      credits: {
        enabled: false,
      },
      chart: {
        zoomType: 'x',
        height: this.allChartHeight,
        width: this.allChartWidth
      },
      title: {
        text: ''
      },
      xAxis: {
        type: 'linear',
        visible: false,
        lineWidth: 0
      },
      yAxis: [{
        labels: {
          format: `{value}`,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        title: {
          text: ''
        },
        lineWidth: 0,
        gridLineColor: 'transparent'
      }],
      legend: {
        enabled: false
      },
      plotOptions: {
      },
      series: [{
        type: 'spline',
        name: tagName,
        data: data,
        color: Highcharts.getOptions().colors[0],
        tooltip: {
          valueSuffix: unit
        },
        marker: {
          enabled: false,
          radius: 3
        }
      }]
    }
    return obj;
  }
  primarySingleChartData(data, tagName, unit, yaxis) {
    let obj = {
      credits: {
        enabled: false,
      },
      chart: {
        zoomType: 'x',
        height: this.activeChartHeight,
        width: null
      },
      title: {
        text: ''
      },
      subtitle: {
        text: document.ontouchstart === undefined ?
          '' : ''
      },
      xAxis: {
        type: 'datetime',
        crosshair: {
          width: 2,
          color: 'red',
          dashStyle: 'shortdot'
        }
      },
      yAxis: [{
        labels: {
          format: `{value} ${unit}`,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        title: {
          text: ''
        },
        min: yaxis.min,
        max: yaxis.max
      }],
      legend: {
        enabled: false
      },
      plotOptions: {
      },
      tooltip: {
        shared: true
      },
      series: [{
        type: 'spline',
        name: tagName,
        data: data,
        color: Highcharts.getOptions().colors[1],
        tooltip: {
          valueSuffix: unit
        },
        marker: {
          enabled: false,
          radius: 3
        }
      }]
    }
    return obj;
  }
  primaryDualChartData(allSeries) {
    let obj = {
      credits: {
        enabled: false,
      },
      chart: {
        zoomType: 'x',
        height: this.activeChartHeight,
        width: null
      },
      title: {
        text: ''
      },
      subtitle: {
        text: document.ontouchstart === undefined ?
          '' : ''
      },
      xAxis: {
        type: 'datetime',
        crosshair: {
          width: 2,
          color: 'red',
          dashStyle: 'shortdot'
        }
      },
      yAxis: allSeries.axis,
      legend: {
        enabled: false
        // layout: 'horizontal',
        // align: 'center',
        // x: 0,
        // verticalAlign: 'top',
        // y: 5,
        // floating: true,
      },
      plotOptions: {
      },
      tooltip: {
        shared: true
      },
      series: allSeries.series
    }
    return obj;
  }
  exportAsCSV() {
    this.exportService.downloadFile(this.jsonData, "tagData")
  }
  setSeriesData(data: any[]) {
    let prevDate;
    let result = [];
    let filteredArray = [];
    if (this.activeFilter === '1 Day') {
      prevDate = moment().tz('America/Denver').subtract(1, 'day').valueOf();
    }
    else if (this.activeFilter === '7 Days') {
      prevDate =moment().tz('America/Denver').subtract(7, 'days').valueOf();
    }
    else if (this.activeFilter === '30 Days') {
      prevDate =moment().tz('America/Denver').subtract(30, 'days').valueOf();
    } else if (this.activeFilter === '3 Months') {
      prevDate =moment().tz('America/Denver').subtract(3, 'months').valueOf();
    } else if (this.activeFilter === '1 Year') {
      prevDate = data[0].aggregateLoadTimeInTimestamp;
    }
    data.forEach((key, index) => {
      if (key.aggregateLoadTimeInTimestamp > prevDate.toString() && filteredArray.length === 0) {
        filteredArray = data.slice((index-1), data.length - 1);
      }
    })
    filteredArray.forEach(key => {
      let obj = [];
      obj.push(parseInt(key.aggregateLoadTimeInTimestamp));
      obj.push(key.value);
      result.push(obj);
    })
    return result;
  }
  setYaxis(yaxis1, yaxis2?, index?) {
    this.first.min = yaxis1.min === null ? 0 : yaxis1.min;
    this.first.max = yaxis1.max === null ? 0 : yaxis1.max;
    if (yaxis2) {
      if (index === 1) {
        this.second.min = yaxis2.min === null ? 0 : yaxis2.min;
        this.second.max = yaxis2.max === null ? 0 : yaxis2.max;
      }
      else if (index === 2) {
        this.third.min = yaxis2.min === null ? 0 : yaxis2.min;
        this.third.max = yaxis2.max === null ? 0 : yaxis2.max;
      }
      else if (index === 3) {
        this.fourth.min = yaxis2.min === null ? 0 : yaxis2.min;
        this.fourth.max = yaxis2.max === null ? 0 : yaxis2.max;
      }
    }
  }
  updateYAxis(type) {
    let index = 0;
    let value;
    if (type === 'first') {
      this.activeChart['yaxis'].min = this.first.min;
      this.activeChart['yaxis'].max = this.first.max;
    }
    if (type === 'second') {
      value = this.second;
      index = 1;
    }
    if (type === 'third') {
      value = this.third;
      index = 2;
    }
    if (type === 'fourth') {
      value = this.fourth;
      index = 3;
    }
    if (index !== 0) {
      this.allChartView.forEach(data => {
        if (data.id === this.activeChart['id'][index].id) {
          data.yaxis.min = value.min;
          data.yaxis.max = value.max;
        }
      })
    }
  }
  getDualSeries() {
    let seriesobj = [];
    let axisObj = [];
    seriesobj.push(
      {
        type: 'spline',
        name: this.activeChart['tagName'][0].name,
        data: this.activeChart['tagYAxis'],
        color: this.colorArr[0],
        tooltip: {
          valueSuffix: this.activeChart['tooltipUnit']
        },
        yAxis: 0,
        marker: {
          enabled: false,
          radius: 3
        }
      }
    )
    axisObj.push(
      {
        labels: {
          format: `{value} ${this.activeChart['tooltipUnit']}`,
          style: {
            color: this.colorArr[0]
          }
        },
        title: {
          text: ''
        },
        min: this.activeChart['yaxis'].min,
        max: this.activeChart['yaxis'].max
      });
    this.allChartView.forEach(data => {
      this.activeChart['id'].slice(1, this.activeChart['id'].length).forEach(tag => {
        if (tag.id === data.id) {
          seriesobj.push({
            type: 'spline',
            name: data.tagName,
            data: data.tagYAxis,
            color: this.colorArr[seriesobj.length],
            tooltip: {
              valueSuffix: data.tooltipUnit
            },
            yAxis: (seriesobj.length),
            marker: {
              enabled: false,
              radius: 3
            }
          })
          axisObj.push(
            {
              labels: {
                format: `{value} ${data.tooltipUnit}`,
                style: {
                  color: this.colorArr[axisObj.length]
                }
              },
              title: {
                text: ''
              },
              min: data.yaxis.min,
              max: data.yaxis.max,
              opposite: ((axisObj.length) % 2) === 0 ? false : true
            });
        }
      })
    })
    return { series: seriesobj, axis: axisObj };
  }
}
