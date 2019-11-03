import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dice-display',
  templateUrl: './dice-display.component.html',
  styleUrls: ['./dice-display.component.css']
})
export class DiceDisplayComponent implements OnInit {

  @Input() dice: {
    id: string,
    type: string,
    value: number
  } 
  @Input() selectOrDeselect?: any;
  @Input() deleteDice?: any;
  @Input() rerollDice?: any;
  @Input() index?: number;
  @Input() role?: string;

  constructor() { }

  ngOnInit() {
  }

  selectOrDeselectDice(id) {
    if (this.selectOrDeselect) {
      this.selectOrDeselect(id)
    }
  }

}
