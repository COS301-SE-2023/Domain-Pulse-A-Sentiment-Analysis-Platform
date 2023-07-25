import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppState } from '../app.state';
import { Select } from '@ngxs/store';

@Component({
  selector: 'comments-view',
  templateUrl: './comments-view.component.html',
  styleUrls: ['./comments-view.component.sass'],
})
export class CommentsViewComponent {
  @Select(AppState.sampleData) sampleData!: Observable<any | null>;

  comments?: any[];
  showComment: boolean[] = [];
  constructor() {
    this.sampleData.subscribe((newSampleData) => {
      if (newSampleData) {
        this.comments = this.transformComments(newSampleData);
      }
    });
    this.initializeShowCommentArray();
  }

  initializeShowCommentArray() {
    if(this.comments){
      this.showComment = Array(this.comments.length).fill(false);

    }
    console.log("comments")
    console.log(this.showComment);
  }

  toggleShowComment(index: number) {
    console.log("toggle comment index")
    this.showComment[index] = !this.showComment[index];
  }

  transformComments(jsonData: any): any[] {
    const individualMetrics = jsonData;

    return individualMetrics.map((metric: any) => ({
      comment: metric.data,
      ratings: [
        `${Math.floor(metric.general.score * 100)}%`,
        metric.general.category.toLowerCase().replace(/_/g, ' '),
        Object.keys(metric.emotions).reduce((a, b) =>
          metric.emotions[a] > metric.emotions[b] ? a : b
        ),
        metric.toxicity.level_of_toxic
      ],
    }));
  }

  getRatingClass(index: number, score: string): string {
    let colorClass = 'neutral-color';
    if (index === 0) {
      colorClass = this.getRatingColor(score);
    }
    else if (index===1){
      colorClass = this.getCategoryColor(score);
    }
    else if (index===2){
      colorClass = this.getEmotionColor(score);
    }
    else if(index===3){
      colorClass = this.getToxicityColor(score);
    }
    return colorClass;
  }


  getRatingColor(score: string): string {
    let colorClass = '';
    if (score.includes('%')) {
      const percentage = parseInt(score, 10);
      if (percentage >= 90) {
        colorClass = 'very-positive-color';
      } else if (percentage >= 70) {
        colorClass = 'positive-color';
      } else if (percentage >= 60) {
        colorClass = 'somewhat-positive-color';
      } else if (percentage >= 40) {
        colorClass = 'neutral-color';
      } else if (percentage >= 30) {
        colorClass = 'somewhat-negative-color';
      } else if (percentage >= 10) {
        colorClass = 'negative-color';
      } else {
        colorClass = 'very-negative-color';
      }
    } else {
      colorClass = 'neutral-color';
    }

    return colorClass;
  }

  getCategoryColor(category: string): string {
    let colorClass = '';
    switch (category) {
      case 'very negative':
        colorClass = 'very-negative-color';
        break;
      case 'negative':
        colorClass = 'negative-color';
        break;
      case 'somewhat negative':
        colorClass = 'somewhat-negative-color';
        break;
      case 'somewhat positive':
        colorClass = 'somewhat-positive-color';
        break;
      case 'positive':
        colorClass = 'positive-color';
        break;
      case 'very positive':
        colorClass = 'very-positive-color';
        break;
      default:
        colorClass = 'neutral-color';
    }
    return colorClass;
  }

  getEmotionColor(emotion: string): string {
    let colorClass = '';
  
    switch (emotion) {
      case 'anger':
      case 'disgust':
      case 'fear':
        colorClass = 'negative-color';
        break;
      case 'joy':
      case 'surprise':
        colorClass = 'positive-color';
        break;
      case 'sadness':
        colorClass = 'sad-color';
        break;
      case 'neutral':
        colorClass = 'neutral-color';
        break;
      default:
        colorClass = 'neutral-color';
    }
  
    return colorClass;
  }

  //Toxic, Non-toxic
  getToxicityColor(toxicity: string): string {
    let colorClass = '';
    toxicity = toxicity.toLowerCase();
    switch (toxicity) {
      case 'toxic':
        colorClass = 'very-negative-color';
        break;
      case 'non-toxic':
        colorClass = 'very-positive-color';
        break;
      default:
        colorClass = 'neutral-color';
    }
  
    return colorClass;
  }
  

  

}
