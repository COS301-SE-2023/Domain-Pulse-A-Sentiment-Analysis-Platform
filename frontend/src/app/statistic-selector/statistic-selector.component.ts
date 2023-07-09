import { Component } from '@angular/core';

@Component({
  selector: 'statistic-selector',
  templateUrl: './statistic-selector.component.html',
  styleUrls: ['./statistic-selector.component.sass'],
})
export class StatisticSelectorComponent {

 /*  mockData = {
    "metrics":
    [
      {
          "data": "Lived up to the expectations. Grab and run... pleasant and fast service. Definitely a must visit again",
          "general": {"category": "VERY_POSITIVE", "score": 0.9994},
          "emotions": {"surprise": 0.015, "neutral": 0.0817, "joy": 0.9033},
          "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
          "ratios": {"positive": 0.353, "neutral": 0.647, "negative": 0.0},
      }
    ]
  }  */

  mockData = 
  {
    "aggregated_metrics": {
      "general": {
          "category": "POSITIVE",
          "score": 0.714
      },
      "emotions": {
          "anger": 0.0231,
          "disgust": 0.012,
          "fear": 0,
          "joy": 0.6777,
          "neutral": 0.0434,
          "sadness": 0.2187,
          "surprise": 0.0251
      },
      "toxicity": {
          "level_of_toxic": "Non-toxic",
          "score": 0.0009
      },
      "ratios": {
          "positive": 0.3031,
          "neutral": 0.6213,
          "negative": 0.0757
      }
    }  
  }

  /* overallScore = 70;

  positiveScore = 70;
  negativeScore = 22;
  neutralScore = 8;

  emotion = "Joy";
  emotionIconUrl = "../../assets/icons/" + this.emotion.toLowerCase() + ".svg";
  
  toxicity = 10;

  analysedSum = "23k";
 */
  assignValues(mockData: { aggregated_metrics: any; metadata?: any; }) {
    const aggregatedMetrics = mockData.aggregated_metrics;
  
    const overallScore = Math.floor(aggregatedMetrics.general.score * 100);
    const positiveScore = Math.floor(aggregatedMetrics.ratios.positive * 100);
    const negativeScore = Math.floor(aggregatedMetrics.ratios.negative * 100);
    const neutralScore = Math.floor(aggregatedMetrics.ratios.neutral * 100);
  
    const emotions = aggregatedMetrics.emotions;
    const emotion = Object.keys(emotions).reduce((a, b) =>
      emotions[a] > emotions[b] ? a : b
    );
    const emotionIconUrl = `../../assets/icons/${emotion.toLowerCase()}.svg`;
  
    const toxicity = Math.floor(aggregatedMetrics.toxicity.score * 100);
  
  
    return {
      overallScore,
      positiveScore,
      negativeScore,
      neutralScore,
      emotion,
      emotionIconUrl,
      toxicity,
      
    };
  }
  
  
  
  // Example usage:
  assignedValues = this.assignValues(this.mockData);
  overallScore = this.assignedValues.overallScore;
  positiveScore = this.assignedValues.positiveScore;
  negativeScore = this.assignedValues.negativeScore;
  neutralScore = this.assignedValues.neutralScore;
  emotion = this.assignedValues.emotion;
  emotionIconUrl = this.assignedValues.emotionIconUrl;
  toxicity = this.assignedValues.toxicity;
  //Mock variable
  analysedSum = "23k";


}
