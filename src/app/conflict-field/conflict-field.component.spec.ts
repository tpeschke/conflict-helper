import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConflictFieldComponent } from './conflict-field.component';

describe('ConflictFieldComponent', () => {
  let component: ConflictFieldComponent;
  let fixture: ComponentFixture<ConflictFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConflictFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConflictFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
