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
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;

  comments?: any[];
  showComment: boolean[] = [];

  showInitialComments = 10;
  showAdditionalComments = 10;

  positiveComments: any[] = [];
  negativeComments: any[] = [];
  neutralComments: any[] = [];

  undecidedComments: any[] = [];

  top10: any[] = [];
  bottom10: any[] = [];

  toxicComments: any[] = [];

  searchTerm = "";

  accordionItems: NodeListOf<Element> | undefined;



  constructor() {
    this.sampleData.subscribe((newSampleData) => {
      console.log("New Sample Data:")
      this.reactToNewComents(newSampleData);
    });
    this.initializeShowCommentArray();
  }

  reactToNewComents(newSampleData: any) {
    console.log("reacting to new comments:")
    if (newSampleData) {
      console.log("transform comments:")
      this.comments = this.transformComments(newSampleData);
      this.groupComments(this.comments);
      console.log("Positive Comments here:")
      console.log(this.positiveComments);
    }
  }

  initializeShowCommentArray() {
    if (this.comments) {
      this.showComment = Array(this.comments.length).fill(false);
    } else {
      this.showComment = [];
    }
  }

  toggleShowComment(index: number) {
    this.showComment[index] = !this.showComment[index];
  }

  transformComments(jsonData: any): any[] {
    const individualMetrics = jsonData;

    const temp = individualMetrics.map((metric: any) => ({
      comment: metric.data,
      ratings: [
        `${Math.floor(metric.general.score * 100)}%`,
        metric.general.category.toLowerCase().replace(/_/g, ' '),
        Object.keys(metric.emotions).reduce((a, b) =>
          metric.emotions[a] > metric.emotions[b] ? a : b
        ),
        metric.toxicity.level_of_toxic,
      ],
      ratingColour: [],
    }));

    return temp.map((comment: any) => {
      comment['ratingCssClass'] = [];
      for (let i = 0; i < comment.ratings.length; i++) {
        comment.ratingCssClass.push(this.getRatingClass(i, comment.ratings[i]));
      }
      return comment;
    });
  }

  groupComments(comments: any[]) {
    console.log("grouping comments:")
    console.log(comments)
    // Sort the comments by overall scores in descending order
    comments.sort((a, b) => {
      const scoreA = parseFloat(a.ratings[0].replace('%', ''));
      const scoreB = parseFloat(b.ratings[0].replace('%', ''));
      return scoreB - scoreA;
    });
  
    // Calculate the number of comments in the top and bottom 10%
    const totalComments = comments.length;
    const top10PercentCount = Math.ceil(totalComments * 0.1);
    const bottom10PercentCount = Math.ceil(totalComments * 0.1);
  
    // Extract the top and bottom 10% of comments
    this.top10 = comments.slice(0, top10PercentCount);
    this.bottom10 = comments.slice(-bottom10PercentCount);
  
    // Initialize other comment arrays (positive, negative, neutral, undecided, and toxic)
    this.positiveComments = [];
    this.negativeComments = [];
    this.neutralComments = [];
    this.undecidedComments = [];
    this.toxicComments = [];
  
    // Loop through comments and categorize them based on ratings
    comments.forEach((comment) => {
      console.log("comment:");
      console.log(comment);
      if (comment.ratings[1].includes('positive')) {
        this.positiveComments.push(comment);
      } else if (comment.ratings[1].includes('negative')) {
        this.negativeComments.push(comment);
      } else if (comment.ratings[1].includes('neutral')) {
        this.neutralComments.push(comment);
      } else {
        this.undecidedComments.push(comment);
      }
    
      if (comment.ratings[3] === 'toxic') {
        this.toxicComments.push(comment);
      }
    });

    console.log("Positive Comments here:")
    console.log(this.positiveComments);
  }

  getRatingClass(index: number, score: string): string {
    let colorClass = 'neutral-color';
    if (index === 0) {
      colorClass = this.getRatingColor(score);
    } else if (index === 1) {
      colorClass = this.getCategoryColor(score);
    } else if (index === 2) {
      colorClass = this.getEmotionColor(score);
    } else if (index === 3) {
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

  filterAccordionByText() {
    const textToFilter = this.searchTerm;
    const shownCategories = new Set();

    if (!this.accordionItems) {
      return;
    }
    if (this.searchTerm === "") {
      this.accordionItems.forEach((item: any) => item.style.display = 'block');
      document.querySelectorAll('.heading').forEach((item: any) => item.style.display = 'block');
      return;
    }

    let atleastOne = false;
    this.accordionItems.forEach((item: any) => {
      const headerTextT = item;
      if (!headerTextT)
        return;
      const text = headerTextT.innerText;
      console.log(headerTextT, text);

      if (text.toLowerCase().includes(textToFilter.toLowerCase())) {
        item.style.display = 'block';
        atleastOne = true;
        shownCategories.add(item.getAttribute('data-catID'));
      } else {
        item.style.display = 'none';
      }
    });

    const noResultsIMG = document.querySelector('#noResults');
    if (noResultsIMG) {
      (noResultsIMG as any).style.display = atleastOne ? 'none' : 'flex';
    }


    const allCategoryElements = document.querySelectorAll('.heading');

    console.log(shownCategories);

    allCategoryElements.forEach((categoryElement: any) => {
      const catID = categoryElement.getAttribute('data-catID');

      if (!shownCategories.has(catID)) {
        categoryElement.style.display = 'none';
      } else {
        categoryElement.style.display = 'block';
      }
    });
  }
}
