import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ig-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss']
})
export class SidePanelComponent implements OnInit {
  @Input() view;
  panelOpenState = false;
  constructor() { }

  ngOnInit(): void {
    console.log("Side",this.view);
  }

}
