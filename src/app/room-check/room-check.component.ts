import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-room-check',
  templateUrl: './room-check.component.html',
  styleUrls: ['./room-check.component.css']
})
export class RoomCheckComponent implements OnInit {

  constructor(
    public router: Router,
    public dialogRef: MatDialogRef<any>
  ) { }

  private room: string = null;

  ngOnInit() {
  }

  setRoom(event) {
    this.room = event.target.value;
  }

  navigateToRoom () {
    this.room = this.room.trim().replace(/\s+/ig, '-')
    this.router.navigate([`/${this.room}`])
    this.dialogRef.close();
  }

}
