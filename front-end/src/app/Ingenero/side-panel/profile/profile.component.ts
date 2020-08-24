import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ig-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @Input() view;
  constructor() { }

  ngOnInit(): void {
    console.log("Profile",this.view);
  }

}
