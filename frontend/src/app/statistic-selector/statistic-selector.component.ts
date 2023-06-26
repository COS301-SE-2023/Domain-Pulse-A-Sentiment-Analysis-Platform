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

  emotion = "Joy";
  emotionIconUrl = "../../assets/logos/" + this.emotion.toLowerCase() + ".png";
  
  toxicity = 10;

  analysedSum = "23k";
}
