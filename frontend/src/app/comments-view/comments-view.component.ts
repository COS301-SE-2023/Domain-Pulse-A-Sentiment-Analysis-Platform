import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { AppState } from '../app.state';
import { Select } from '@ngxs/store';

@Component({
  selector: 'comments-view',
  templateUrl: './comments-view.component.html',
  styleUrls: ['./comments-view.component.sass'],
})
export class CommentsViewComponent implements AfterViewInit {
  @Select(AppState.sampleData) sampleData!: Observable<any | null>;
  @Select(AppState.sourceIsLoading) sourceIsLoading$!: Observable<boolean>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  comments?: any[];
  showComment: boolean[] = [];

  showInitialCommentsPositive = 10;
  showInitialCommentsNegative = 10;
  showInitialCommentsNeutral = 10;
  showInitialCommentsUndecided = 10;
  showInitialCommentsToxic = 10;
  showInitialCommentsTop10 = 10;
  showInitialCommentsBottom10 = 10;
  showInitialComments = 10;

  showAdditionalComments = 10;

  positiveComments: any[] = [];
  negativeComments: any[] = [];
  neutralComments: any[] = [];

  undecidedComments: any[] = [];

  top10Comments: any[] = [];
  bottom10Comments: any[] = [];

  toxicComments: any[] = [];

  searchTerm = '';

  accordionItems: NodeListOf<Element> | undefined;

  constructor(private hostElement: ElementRef) {
    this.sampleData.subscribe((newSampleData) => {
      console.log('New Sample Data:');
      this.reactToNewComents(newSampleData);
      this.accordionItems = document.querySelectorAll('commentsAccordion');
      console.log('accordion items initialized');
      console.log(this.accordionItems);
    });
    this.initializeShowCommentArray();
  }

  ngAfterViewInit() {}

  reactToNewComents(newSampleData: any) {
    console.log('reacting to new comments:');
    if (newSampleData) {
      console.log('transform comments:');
      this.comments = this.transformComments(newSampleData);
      this.groupComments(this.comments);
      console.log('Positive Comments here:');
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

    const temp = individualMetrics.map((metric: any, index: number) => ({
      id: `comment-${index + 1}`,
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
    console.log('grouping comments:');
    console.log(comments);
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
    this.top10Comments = comments.slice(0, top10PercentCount);
    this.bottom10Comments = comments.slice(-bottom10PercentCount);

    // Initialize other comment arrays (positive, negative, neutral, undecided, and toxic)
    this.positiveComments = [];
    this.negativeComments = [];
    this.neutralComments = [];
    this.undecidedComments = [];
    this.toxicComments = [];

    // Loop through comments and categorize them based on ratings
    comments.forEach((comment) => {
      console.log('comment:');
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

    console.log('Positive Comments here:');
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
        colorClass = 'very-positive-color';
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

    let atleastOne = false;

    let noResultsIMG = document.querySelector('#noResults');
      if (noResultsIMG) {
        (noResultsIMG as any).style.display = 'none';
      }

    if (!this.accordionItems) return;

    // If the search term is empty, show all comments and accordions
    if (!textToFilter) {
      this.showInitialCommentsPositive = 10;
      this.showInitialCommentsNegative = 10;
      this.showInitialCommentsNeutral = 10;
      this.showInitialCommentsUndecided = 10;
      this.showInitialCommentsToxic = 10;
      this.showInitialCommentsTop10 = 10;
      this.showInitialCommentsBottom10 = 10;

      this.accordionItems.forEach((item: any) => {
        item.classList.remove('hide-element'); // Show the accordion
        const comments = item.querySelectorAll('.comment'); // Select all comments within the accordion

        comments.forEach((comment: any) => {
          comment.classList.remove('hide-element'); // Show the individual comment
          shownCategories.add(item.getAttribute('data-catID'));
        });
      });

      // Show all categories
      document.querySelectorAll('.heading').forEach((categoryElement: any) => {
        categoryElement.classList.remove('hide-element');
      });

      

      return;
    }

    this.showInitialCommentsPositive = this.positiveComments.length;
    this.showInitialCommentsNegative = this.negativeComments.length;
    this.showInitialCommentsNeutral = this.neutralComments.length;
    this.showInitialCommentsUndecided = this.undecidedComments.length;
    this.showInitialCommentsToxic = this.toxicComments.length;
    this.showInitialCommentsTop10 = this.top10Comments.length;
    this.showInitialCommentsBottom10 = this.bottom10Comments.length;

    // Hide all accordions and categories initially
    this.accordionItems.forEach((item: any) => {
      item.classList.add('hide-element');
    });

    document.querySelectorAll('.heading').forEach((item: any) => {
      item.classList.add('hide-element');
    });

    this.accordionItems.forEach((item: any) => {
      const comments = item.querySelectorAll('.comment'); // Select all comments within the accordion
      let accordionHasMatchingComment = false;

      comments.forEach((comment: any) => {
        const commentText = comment.innerText.toLowerCase();
        if (commentText.includes(textToFilter.toLowerCase())) {
          atleastOne = true;
          comment.classList.remove('hide-element'); // Show the individual comment
          accordionHasMatchingComment = true; // Mark that the accordion has a matching comment
          shownCategories.add(item.getAttribute('data-catID'));
        } else {
          comment.classList.add('hide-element'); // Hide the individual comment
        }
      });

      // Show or hide the accordion based on whether it has matching comments
      if (accordionHasMatchingComment) {
        item.classList.remove('hide-element');
        shownCategories.add(item.getAttribute('data-catID'));
      }
    });

    // Show categories that have matching comments
    document.querySelectorAll('.heading').forEach((categoryElement: any) => {
      const catID = categoryElement.getAttribute('data-catID');
      if (shownCategories.has(catID)) {
        categoryElement.classList.remove('hide-element');
      }
    });

    noResultsIMG = document.querySelector('#noResults');
    if (noResultsIMG) {
      (noResultsIMG as any).style.display = atleastOne ? 'none' : 'flex';
    }
  }
}
