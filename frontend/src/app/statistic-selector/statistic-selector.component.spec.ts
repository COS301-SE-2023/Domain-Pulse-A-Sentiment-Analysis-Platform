import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticSelectorComponent } from './statistic-selector.component';

describe('StatisticSelectorComponent', () => {
  let component: StatisticSelectorComponent;
  let fixture: ComponentFixture<StatisticSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatisticSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
