import { Component } from '@angular/core';

@Component({
  selector: 'statistic-selector',
  templateUrl: './statistic-selector.component.html',
  styleUrls: ['./statistic-selector.component.sass'],
})
export class StatisticSelectorComponent {
  overrallScore = 70;

  positiveScore = 70;
  negativeScore = 22;
  neutralScore = 8;

  objectivityScore = 12;
  subjectivityScore = 87;

  analysedSum = 23_000;
}
