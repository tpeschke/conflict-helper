import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { DiceService } from '../dice.service';
import { Router, NavigationEnd } from '@angular/router'
import { Socket } from 'ngx-socket-io';
import { SocketService } from '../socket.service'
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { RoomCheckComponent } from '../room-check/room-check.component'
import { ProfileComponent } from '../profile/profile.component'
import { HttpClient } from '@angular/common/http';
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
    private dialog: MatDialog,
    private http: HttpClient
  ) { }

  private playerId: string;
  private conflictType = 'normal';

  private dicePool = []
  private selectedDice = []
  private helperDice = [];
  private total = 0;
  private toBeat = 0;
  private foeSelected = []

  private escalations = null;
  private stressDice = null;
  private matches = null;

  private team = null;
  private role = null;
  private room = '/';
  private name = null;

  private waitingToEscalate = [null, null, null, null, null, null, null, null]

  private messages = []
  private players = []

  private powerlessToBeat = 4;

  ngOnInit() {
    this.playerId = this.diceService.createId()
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
          if (result.team !== this.team && result.role === 'main' && this.team && this.role && this.name) {
            this.foeSelected = result.selectedDice;
            this.toBeat = this.foeSelected.reduce((a, { value }) => a + value, 0);
          } else if (result.team === this.team && result.role === 'main' && this.role === 'main') {
            //put warning here that there can't be two main people per Conflict
          } else if (result.team === this.team && result.role === 'helper' && this.role === 'main') {
            if (!this.helperDice) {
              this.helperDice = []
            }
            this.helperDice.push(...result.selectedDice);
            this.total = this.calculateTotal()
          }
        })

        this.socket.on(`${val.url}-message`, result => {
          if (result.playerId !== this.playerId) {
            this.toastr[result.type]('', result.message)
          } else if (result.playerId === this.playerId && result.warning) {
            this.toastr.warning('', result.warning)
            this.role = result.role
          }
          
          if (result.code === "newPlayer" || result.code === 'change') {
            this.players = result.storage.players
            this.conflictType = result.conflictType
            if (result.storage.currentTurn.team && this.team && result.storage.currentTurn.team !== this.team) {
              this.foeSelected = result.storage.currentTurn.selectedDice
            }
            
            this.toBeat = result.storage.currentTurn.selectedDice.reduce((a, { value }) => a + value, 0)
          } else if (result.code === "conflictChange") {
            this.conflictType = result.conflictType;
          }
          this.messages = result.storage.messages
        })

        this.socket.on(`${val.url}-leave`, result => {
          this.toastr[result.type]('', result.message)
          this.players = result.players
        })

        this.socket.on(`${val.url}-rejectHelper`, result => {
          if (this.name === result.owner) {
            this.toastr.warning('', 'Your helper dice was sent back')
            let { room, owner, helper, ...dice } = result
            this.dicePool.push(dice)
            this.sortDice()
          }
        })

        //bottom of ngOnInit
      }
    });

    this.deselectDice = this.deselectDice.bind(this)
    this.selectDice = this.selectDice.bind(this)
    this.deleteDice = this.deleteDice.bind(this)
    this.rerollDice = this.rerollDice.bind(this)
    this.rerollDice = this.rerollDice.bind(this)
    this.sendBackHelper = this.sendBackHelper.bind(this)
    this.changeTeam = this.changeTeam.bind(this)
    this.changeRole = this.changeRole.bind(this)
    this.changeName = this.changeName.bind(this)
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event) {
    this.socketListener.leaveConflict({ playerId: this.playerId, room: this.room, type: 'error', message: `${this.name} has left the Conflict :(` })
  }

  openSideNav() {
    this.drawer.opened = true
  }

  sortDice() {
    this.dicePool = this.dicePool.sort((a, b) => (a.value > b.value) ? 1 : -1)
    this.total = this.calculateTotal()
  }

  calculateTotal() {
    return this.selectedDice.reduce((a, { value }) => a + value, 0) + this.helperDice.reduce((a, { value }) => a + value, 0);;
  }

  escalateDicePool() {
    let diceToEscalate = this.waitingToEscalate.map((val, index) => {
      return { typeIndex: index, number: val }
    })

    let newDice = this.diceService.addDiceToPool(diceToEscalate)
    this.dicePool = [...this.dicePool, ...newDice]
    this.sortDice()
    if (this.escalations || this.escalations === 0) {
      this.escalations = this.escalations + 1
      this.socketListener.sendMessage({ code: 'dicePoolChange', dicePoolCount: this.dicePool.length, escalations: this.escalations, playerId: this.playerId, team: this.team, role: this.role, room: this.room, type: 'success', message: `${this.name} has escalated` })
    } else {
      this.escalations = 0
      this.socketListener.sendMessage({ code: 'dicePoolChange', dicePoolCount: this.dicePool.length, escalations: this.escalations, playerId: this.playerId, team: this.team, role: this.role, room: this.room, type: 'success', message: `${this.name} added dice to their pool` })
    }
    this.waitingToEscalate = [null, null, null, null, null, null, null, null]
    this.drawer.opened = false
  }

  addToEscalate(event, index) {
    if (+event.target.value) {
      this.waitingToEscalate[index] = +event.target.value
    }
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

  sendBackHelper(id) {
    let rejectedHelper = null;
    this.helperDice.forEach((val, index) => {
      if (val.id === id) {
        rejectedHelper = this.helperDice.splice(index, 1)[0]
      }
    })
    if (rejectedHelper) {
      this.socketListener.sendBackHelper({ ...rejectedHelper, room: this.room })
    }
  }

  deleteDice(e, id) {
    e.stopPropagation()
    this.dicePool.forEach((val, index) => {
      if (val.id === id) {
        this.dicePool.splice(index, 1)
      }
    })
    this.socketListener.sendMessage({ code: 'dicePoolChange', dicePoolCount: this.dicePool.length, playerId: this.playerId, team: this.team, role: this.role, room: this.room, type: 'warning', message: `${this.name} deleted one of their dice` })
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
      this.socketListener.sendMessage({ playerId: this.playerId, team: this.team, role: this.role, room: this.room, type: 'warning', message: `${this.name} has reroll 1 of their dice` })
    } else if (modifier === 1) {
      this.socketListener.sendMessage({ playerId: this.playerId, team: this.team, role: this.role, room: this.room, type: 'warning', message: `${this.name} has increased and rerolled 1 of their dice` })
    } else if (modifier === -1) {
      this.socketListener.sendMessage({ playerId: this.playerId, team: this.team, role: this.role, room: this.room, type: 'warning', message: `${this.name} has decreased and rerolled 1 of their dice` })
    } else {
      this.socketListener.sendMessage({ playerId: this.playerId, team: this.team, role: this.role, room: this.room, type: 'error', message: `Something went wrong when ${this.name} tried to reroll 1 of their dice` })
    }
  }

  changeTeam(event) {
    if (!this.team) {
      this.team = event.value
      this.checkIfJoined()
    } else {
      this.team = event.value
      this.socketListener.sendMessage({ code: 'change', change: 'team', playerId: this.playerId, team: this.team, role: this.role, room: this.room, type: 'warning', message: `${this.name} has changed to ${this.team} team` })
    }
  }

  changeRole(event) {
    if (!this.role) {
      this.role = event.value
      this.checkIfJoined()
    } else {
      this.role = event.value
      this.socketListener.sendMessage({ code: 'change', change: 'role', playerId: this.playerId, team: this.team, role: this.role, room: this.room, type: 'warning', message: `${this.name} has changed to ${this.role}` })
    }
  }

  changeName(event) {
    if (!this.name) {
      this.name = event.target.value
      this.checkIfJoined()
    } else {
      let oldName = this.name
      this.name = event.target.value
      this.socketListener.sendMessage({ code: 'change', change: 'name', playerId: this.playerId, name: this.name, team: this.team, role: this.role, room: this.room, type: 'success', message: `${oldName} has become ${this.name}` })
    }
  }

  changeConflictType(event) {
    this.toastr.success('', `You've changed the Conflict type to ${event.value}`)
    this.socketListener.sendMessage({ code: 'conflictChange', conflictType: event.value, playerId: this.playerId, name: this.name, team: this.team, role: this.role, room: this.room, type: 'success', message: `${this.name} has changed the Conflict Type to ${event.value}` })
  }

  checkIfJoined() {
    if (this.team && this.role && this.name) {
      this.socketListener.sendMessage({ code: 'newPlayer', playerId: this.playerId, name: this.name, team: this.team, role: this.role, room: this.room, dicePoolCount: 0, type: 'success', message: `${this.name} has joined the conflict` })
      this.toastr.success('', `You've successfully joined the conflict in room ${this.room.substring(1)}`)
    }
  }

  endTurn() {
    let stressDice = this.selectedDice.length - 2
    if (stressDice > 0) {
      !this.stressDice ? this.stressDice = 0 : null;
      this.stressDice = stressDice + this.stressDice;
    }
    if (this.toBeat === this.total) {
      !this.matches ? this.matches = 0 : null;
      this.matches = ++this.matches;
    }
    if (this.role === 'helper') {
      this.selectedDice = this.selectedDice.map(val => {
        val.helper = true;
        return val
      })
    } else if (this.role === 'main' && this.helperDice) {
      this.selectedDice.push(...this.helperDice);
      this.helperDice = []
    }
    this.socketListener.sendInfo({ room: this.room, team: this.team, role: this.role, selectedDice: this.selectedDice })

    if (this.role === 'main') {
      this.toBeat = this.total;
      this.foeSelected = []
    }
    this.total = 0;
    this.selectedDice = [];
  }

  endTurnpowerless() {
    this.socketListener.sendInfo({ room: this.room, team: this.team, role: this.role, selectedDice: [{id: "powerlesstobeat", value: this.powerlessToBeat, type: "powerless"}] });
    this.powerlessToBeat += 4;
  }

  openProfile() {
    this.dialog.open(ProfileComponent, {
      width: '250px',
      position: {
        top: '15px'
      },
      data: {
        team: this.team,
        role: this.role,
        name: this.name,
        escalations: this.escalations,
        matches: this.matches,
        stressDice: this.stressDice,
        changeName: this.changeName,
        changeTeam: this.changeTeam,
        changeRole: this.changeRole,
        getColor: this.getColor
      }
    });
  }

  getColor(team) {
    if (team === 'red') {
      return '#9e0000'
    } else if (team === 'blue') {
      return '#00009e'
    } else {
      return '#000'
    }
  }
}
