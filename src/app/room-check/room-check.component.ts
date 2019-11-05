import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-room-check',
  templateUrl: './room-check.component.html',
  styleUrls: ['./room-check.component.css']
})
export class RoomCheckComponent implements OnInit {

  constructor() { }

  private room: string = null;

  ngOnInit() {
  }

  setRoom(event) {
    this.room = event.target.value;
  }

  navigateToRoom () {
    if (this.room && this.room !== '') {

    }
  }

}
