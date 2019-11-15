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

  createDice(typeIndex, additionalDice?) {
    if (this.diceHierarchy[typeIndex] && !additionalDice) {
      let sides = +this.diceHierarchy[typeIndex].substring(1)
      return { id: this.createId(), value: this.rollDice(sides), type: this.diceHierarchy[typeIndex] }
    } else {
      let totalValue = 0;
      let d20s = Math.floor(additionalDice / 7)
      let extra = additionalDice > 7 ? additionalDice % 7 : 0;
      for (let i = 1; i < d20s; i++) {
        totalValue = totalValue + this.rollDice(20);
      }
      totalValue = totalValue + this.rollDice(+this.diceHierarchy[extra].substring(1))
      return { id: this.createId(), value: totalValue, type: 'd20' }
    }
  }

  rerollDice(type, modifier) {
    let typeIndex = this.diceHierarchy.indexOf(type)
    return this.createDice(typeIndex + modifier)
  }

  addDiceToPool(newDiceArray) {
    let createdDiceArray = []
    for (let typeIndex = 0; typeIndex < 7; typeIndex++) {
      let number = newDiceArray[typeIndex].number
      if (number !== 0 && number) {
        for (let i = 0; i < number; i++) {
          if (typeIndex === 6) {
            createdDiceArray.push(this.createDice(typeIndex, newDiceArray[7].number + 6))
          } else {
            createdDiceArray.push(this.createDice(typeIndex))
          }
        }
      }
    }
    return createdDiceArray
  }
}
