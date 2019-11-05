import { Component, OnInit, ViewChild } from '@angular/core';
import { DiceService } from '../dice.service';
import { Router, NavigationEnd } from '@angular/router'
import { Socket } from 'ngx-socket-io';
import { SocketService } from '../socket.service'
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { RoomCheckComponent } from '../room-check/room-check.component'
@Component({
  selector: 'app-conflict-field',
  templateUrl: './conflict-field.component.html',
  styleUrls: ['./conflict-field.component.css']
})

export class ConflictFieldComponent implements OnInit {

  @ViewChild('drawer') drawer: any;

  constructor(
    private diceService: DiceService,
    private router: Router,
    private socket: Socket,
    private socketListener: SocketService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) { }

  private dicePool = []
  private selectedDice = []
  private helperDice = null;
  private total = 0;
  private toBeat = 0;
  private foeSelected = []

  private team = null;
  private role = null;
  private room = '/';
  private name = null;

  private waitingToEscalate = [null, null, null, null, null, null, null]

  private messages = []

  ngOnInit() {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.room = val.url;

        if (val.url === '/') {
          this.dialog.open(RoomCheckComponent, {
            width: '350px',
            disableClose: true
          });
        }

        this.socket.on(`${val.url}-turn`, result => {
          if (result.team.borderTop !== this.team.borderTop && result.role === 'main') {
            this.foeSelected = result.selectedDice;
            this.toBeat = this.foeSelected.reduce((a, { value }) => a + value, 0);
          } else if (result.team.borderTop === this.team.borderTop && result.role === 'main' && this.role === 'main') {
            //put warning here that there can't be two main people per Conflict
          } else if (result.team.borderTop === this.team.borderTop && result.role === 'helper' && this.role === 'main') {
            if (!this.helperDice) {
              this.helperDice = []
            }
            this.helperDice.push(...result.selectedDice);
            this.total = this.calculateTotal()
          }
        })

        this.socket.on(`${val.url}-message`, result => {
          if (result.name !== this.name) {
            this.toastr[result.type]('', result.message)
          }
          this.messages.push(result)
        })
      }
    });
    this.sortDice()
    
    this.deselectDice = this.deselectDice.bind(this)
    this.selectDice = this.selectDice.bind(this)
    this.deleteDice = this.deleteDice.bind(this)
    this.rerollDice = this.rerollDice.bind(this)
  }

  openSideNav() {
    this.drawer.opened = true
  }

  sortDice() {
    this.dicePool = this.dicePool.sort((a, b) => (a.value > b.value) ? 1 : -1)
    this.total = this.calculateTotal()
  }

  calculateTotal() {
    if (this.helperDice) {
      return this.selectedDice.reduce((a, { value }) => a + value, 0) + this.helperDice.reduce((a, { value }) => a + value, 0);;
    } else {
      return this.selectedDice.reduce((a, { value }) => a + value, 0);
    }
  }

  escalateDicePool() {
    let diceToEscalate = this.waitingToEscalate.map((val, index) => {
      return { typeIndex: index, number: val }
    })

    let newDice = this.diceService.addDiceToPool(diceToEscalate)
    this.dicePool = [...this.dicePool, ...newDice]
    this.sortDice()
    this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'success', message: `${this.name} has escalated` })
    this.waitingToEscalate = [null, null, null, null, null, null, null]
    this.drawer.opened = false
  }

  addToEscalate(event, index) {
    this.waitingToEscalate[index] = +event.target.value
  }

  selectDice(id) {
    this.dicePool.forEach((val, index) => {
      if (val.id === id) {
        let newSelect = this.dicePool.splice(index, 1)[0]
        this.selectedDice.push(newSelect)
        this.total = this.calculateTotal()
      }
    })
  }

  deselectDice(id) {
    this.selectedDice.forEach((val, index) => {
      if (val.id === id) {
        let removeSelect = this.selectedDice.splice(index, 1)[0]
        this.dicePool.push(removeSelect)
      }
    })
    this.sortDice()
  }

  deleteDice(e, id) {
    e.stopPropagation()
    this.dicePool.forEach((val, index) => {
      if (val.id === id) {
        this.dicePool.splice(index, 1)
      }
    })
    this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'warning', message: `${this.name} deleted one of their dice` })
  }

  rerollDice(e, id, modifier) {
    e.stopPropagation()
    this.dicePool.forEach((val, index) => {
      if (val.id === id) {
        let toReroll = this.dicePool.splice(index, 1)[0]
        let newDice = this.diceService.rerollDice(toReroll.type, +modifier)
        this.dicePool.push(newDice)
      }
    })
    this.sortDice()
    if (modifier === 0) {
      this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'warning', message: `${this.name} has reroll 1 of their dice` })
    } else if (modifier === 1) {
      this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'warning', message: `${this.name} has increased and rerolled 1 of their dice` })
    } else if (modifier === -1) {
      this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'warning', message: `${this.name} has decreased and rerolled 1 of their dice` })
    } else {
      this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'error', message: `Something went wrong when ${this.name} tried to reroll 1 of their dice` })
    }
  }

  changeTeam(event) {
    this.team = event.value
    if (this.name) {
      if (this.team.borderTop === '10px solid rgb(158, 0, 0)') {
        this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'warning', message: `${this.name} has changed to Red team` })
      } else if (this.team.borderTop === '10px solid rgb(0, 0, 158)') {
        this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'warning', message: `${this.name} has changed to Blue team` })
      } else {
        this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'error', message: `Something went wrong when ${this.name} tried to switch teams` })
      }
    }
  }

  changeRole(event) {
    this.role = event.value
    if (this.name) {
      if (this.role === "main") {
        this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'warning', message: `${this.name} has changed to the main player` })
      } else if (this.role === "helper") {
        this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'warning', message: `${this.name} has changed to a helper` })
      } else {
        this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'error', message: `Something went wrong when ${this.name} tried to switch roles` })
      }
    }
  }

  changeName(event) {
    let oldName = this.name
    this.name = event.target.value
    if (!oldName) {
      this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'success', message: `${this.name} has joined the conflict` })
      this.toastr.success('', `You've successfully joined the conflict in room ${this.room.substring(1)}`)
    } else {
      this.socketListener.sendMessage({ name: this.name, room: this.room, type: 'success', message: `${oldName} has become ${this.name}` })
    }
  }

  endTurn() {
    if (this.role === 'helper') {
      this.selectedDice = this.selectedDice.map(val => {
        val.helper = true;
        return val
      })
    } else if (this.role === 'main' && this.helperDice) {
      this.selectedDice.push(...this.helperDice);
      this.helperDice = null
    }
    this.socketListener.sendInfo({ room: this.room, team: this.team, role: this.role, selectedDice: this.selectedDice })

    if (this.role === 'main') {
      this.toBeat = this.total;
      this.foeSelected = []
    }
    this.total = 0;
    this.selectedDice = [];
  }
}
