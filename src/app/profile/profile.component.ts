import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  private getColor = this.data.getColor
  private matches = this.data.matches
  private stressDice = this.data.stressDice
  private escalations = this.data.escalations
  private name = this.data.name
  private role = this.data.role
  private team = this.data.team
  private changeName = this.data.changeName
  private changeRole = this.data.changeRole
  private changeTeam = this.data.changeTeam

  ngOnInit() {
  }

  swapRole(event) {
    this.role = event.value
    this.changeRole(event)
  }

}
