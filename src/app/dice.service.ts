import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiceService {

  constructor() { }

  private diceHierarchy = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20']

  createId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }

  createDice(typeIndex) {
    if (this.diceHierarchy[typeIndex]) {
      let sides = +this.diceHierarchy[typeIndex].substring(1)
      return {id: this.createId(), value: this.rollDice(sides), type: this.diceHierarchy[typeIndex]}
    }
  }

  rerollDice(type, modifier) {
      let typeIndex = this.diceHierarchy.indexOf(type)
      return this.createDice(typeIndex + modifier)
  }

  addDiceToPool(newDiceArray) {
    let createdDiceArray = []
    newDiceArray.forEach(({typeIndex, number}) => {
      if (number !== 0 && number) {
        for (let i = 0; i < number; i ++) {
          createdDiceArray.push(this.createDice(typeIndex))
        }
      }
    })
    return createdDiceArray
  }
}
