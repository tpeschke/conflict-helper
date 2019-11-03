import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceDisplayComponent } from './dice-display.component';

describe('DiceDisplayComponent', () => {
  let component: DiceDisplayComponent;
  let fixture: ComponentFixture<DiceDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiceDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiceDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
