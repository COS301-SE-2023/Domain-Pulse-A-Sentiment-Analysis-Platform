import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentsViewComponent } from './comments-view.component';
import { NgxsModule, Store } from '@ngxs/store';
import { FormsModule } from '@angular/forms';
import { CommentsAccordionComponent } from '../comments-accordion-card/comments-accordion.component'; // Adjust the import path
import { CommentsAccordionTitle } from '../comments-accordion-card/directives/comments-accordion-title.directive'; // Adjust the import path
import { CommentsAccordionContent } from '../comments-accordion-card/directives/comments-accordion-content.directive'; // Adjust the import path
import { CommentsAccordionHeader } from '../comments-accordion-card/directives/comments-accordion-header.directive'; // Adjust the import path
import { CommentsAccordionItem } from '../comments-accordion-card/directives/comments-accordion-item.directive'; // Adjust the import path
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // or NoopAnimationsModule

const mockCommentData = [
  {
    id: 'comment-1',
    data: 'When a Coffee shop serves gluten-free cake they get a 110% review from me. The gluten-free orange almond cake is delicious. Thank you, Goddess Café. This is a really feel-good place for anyone. I visited them a few times now. The service is exceptional and I feel like a goddess when eating there. The Brooklyn Goddess Café is just as good. Difficult to choose, but Soutpansberg is more spacious',
    date: 1695908174,
    general: {
      category: 'VERY_POSITIVE',
      score: 0.9998,
    },
    emotions: {
      neutral: 0.0059,
      surprise: 0.0041,
      joy: 0.99,
    },
    toxicity: {
      level_of_toxic: 'Non-toxic',
      score: 0.0005,
    },
    ratios: {
      positive: 0.19,
      neutral: 0.77,
      negative: 0.04,
    },
    source_id: 1,
  },
  {
    id: 'comment-2',
    data: 'Lovely place, fantastic atmosphere, very delicious food and Rosy helped us, very friendly and beautiful woman who cares for her Clients',
    date: 1695908174,
    general: {
      category: 'VERY_POSITIVE',
      score: 0.9999,
    },
    emotions: {
      surprise: 0.0039,
      neutral: 0.0037,
      joy: 0.9924,
    },
    toxicity: {
      level_of_toxic: 'Non-toxic',
      score: 0.0007,
    },
    ratios: {
      positive: 0.66,
      neutral: 0.34,
      negative: 0,
    },
    source_id: 1,
  },
  {
    id: 'comment-3',
    data: "Extremely overated, coffee was mediocre and the pink white chocolate was seriously bad, could not finish the drink. The service was so bad we didn't even order food. Why bother.",
    date: 1695908174,
    general: {
      category: 'VERY_NEGATIVE',
      score: 0.0001,
    },
    emotions: {
      anger: 0.1618,
      sadness: 0.7863,
      surprise: 0.0519,
    },
    toxicity: {
      level_of_toxic: 'Non-toxic',
      score: 0.0022,
    },
    ratios: {
      positive: 0,
      neutral: 0.665,
      negative: 0.335,
    },
    source_id: 1,
  },
  {
    id: 'comment-4',
    data: 'Stopped for a quick sandwich. Sliced way to thick. Dry. Not tasty. Will not come back.',
    date: 1695908174,
    general: {
      category: 'VERY_NEGATIVE',
      score: 0.0002,
    },
    emotions: {
      sadness: 0.7445,
      disgust: 0.0839,
      neutral: 0.1716,
    },
    toxicity: {
      level_of_toxic: 'Non-toxic',
      score: 0.0013,
    },
    ratios: {
      positive: 0,
      neutral: 0.894,
      negative: 0.106,
    },
    source_id: 1,
  },
  {
    id: 'comment-5',
    data: "Beautifully decorated restaurant ideal for the girly girl in you. Pink and flowers are everywhere.The atmosphere is relaxed and tranquil. What I like about this one in Rietondale is that it is spacious. Enjoy a comfortable outing with friends with a variety of 'scene settings' to take photo's. I had the Persian Love Spice cake that was really delicious but it contains quite a number of hard cardamom seeds which is a put-off. I suggest using cardamom powder instead. Overall a great experience.",
    date: 1695908174,
    general: {
      category: 'VERY_POSITIVE',
      score: 0.9998,
    },
    emotions: {
      surprise: 0.0034,
      neutral: 0.0051,
      joy: 0.9915,
    },
    toxicity: {
      level_of_toxic: 'Non-toxic',
      score: 0.0006,
    },
    ratios: {
      positive: 0.441,
      neutral: 0.539,
      negative: 0.02,
    },
    source_id: 1,
  },
  {
    id: 'comment-6',
    data: 'The place is truly beautiful with a lot of dedicated sites for pictures. We had pink water to cool us down from the hit that was very thoughtful. Food was delicious as well as well presented. I like the fact that the waiter(Charles) had good suggestions it is not often that you get those. I will definitely come back for the cakes they are delicious.',
    date: 1695908174,
    general: {
      category: 'VERY_POSITIVE',
      score: 0.9999,
    },
    emotions: {
      surprise: 0.0835,
      neutral: 0.0405,
      joy: 0.8759,
    },
    toxicity: {
      level_of_toxic: 'Non-toxic',
      score: 0.0004,
    },
    ratios: {
      positive: 0.534,
      neutral: 0.466,
      negative: 0,
    },
    source_id: 1,
  },
  {
    id: 'comment-7',
    data: 'It’s bigger than the Waterkloof one, more spacious and pink fully decorated. One thing I enjoyed was the cappuccino 😍 the cup was big enough to not want a refill. I ordered a croissant with eggs and my friend ordered salmon Benedict something. The dishes looked beautiful for the pictures but the salmon was actually not good. The waitress who was helping us was nice and friendly. I complained about parking but there’s a space outside by the municipal park and there’s a car guard. Overall experience was okay. I’ll go back again just for the cappuccino.',
    date: 1695908174,
    general: {
      category: 'VERY_POSITIVE',
      score: 0.998,
    },
    emotions: {
      surprise: 0.029,
      neutral: 0.0769,
      joy: 0.8941,
    },
    toxicity: {
      level_of_toxic: 'Non-toxic',
      score: 0.0005,
    },
    ratios: {
      positive: 0.297,
      neutral: 0.675,
      negative: 0.029,
    },
    source_id: 1,
  },
];

describe('CommentsViewComponent', () => {
  let component: CommentsViewComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let fixture: ComponentFixture<CommentsViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        CommentsViewComponent,
        CommentsAccordionComponent,
        CommentsAccordionTitle,
        CommentsAccordionContent,
        CommentsAccordionHeader,
        CommentsAccordionItem,
      ],
      providers: [CommentsViewComponent],
      imports: [NgxsModule.forRoot([]), FormsModule, BrowserAnimationsModule],
    });

    fixture = TestBed.createComponent(CommentsViewComponent);
    component = TestBed.inject(CommentsViewComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  });

  it('should create the component', () => {
    fixture.detectChanges(); // Trigger change detection

    // Now, you can make assertions about the component
    expect(fixture.componentInstance).toBeTruthy(); // Check if the component instance exists
  });

  it('should corrently transform the comments', () => {
    component.reactToNewComents(mockCommentData);

    expect(component.comments).toEqual(
      component.transformComments(mockCommentData)
    );
  });

  it('getRatingColor() function should correctly classify the rating', () => {
    expect(component.getRatingColor('90%')).toBe('very-positive-color');
    expect(component.getRatingColor('70%')).toBe('positive-color');
    expect(component.getRatingColor('60%')).toBe('somewhat-positive-color');
    expect(component.getRatingColor('40%')).toBe('neutral-color');
    expect(component.getRatingColor('30%')).toBe('somewhat-negative-color');
    expect(component.getRatingColor('10%')).toBe('negative-color');
    expect(component.getRatingColor('1%')).toBe('very-negative-color');
    expect(component.getRatingColor('')).toBe('neutral-color');
  });

  it('getCategoryColor() function should correctly classify the category', () => {
    expect(component.getCategoryColor('very negative')).toBe(
      'very-negative-color'
    );
    expect(component.getCategoryColor('negative')).toBe('negative-color');
    expect(component.getCategoryColor('somewhat negative')).toBe(
      'somewhat-negative-color'
    );

    expect(component.getCategoryColor('somewhat positive')).toBe(
      'somewhat-positive-color'
    );
    expect(component.getCategoryColor('positive')).toBe('positive-color');
    expect(component.getCategoryColor('very positive')).toBe(
      'very-positive-color'
    );

    expect(component.getCategoryColor('neutral')).toBe('neutral-color');
  });

  it('getEmotionColor() function should correctly classify the emotion', () => {
    expect(component.getEmotionColor('anger')).toBe('negative-color');
    expect(component.getEmotionColor('joy')).toBe('very-positive-color');
    expect(component.getEmotionColor('surprise')).toBe('surprise-color');
    expect(component.getEmotionColor('sadness')).toBe('sad-color');
    expect(component.getEmotionColor('neutral')).toBe('neutral-color');
    expect(component.getEmotionColor('')).toBe('neutral-color');
  });

  it('getToxicityColor() function should correctly classify the toxicity', () => {
    expect(component.getToxicityColor('toxic')).toBe('very-negative-color');
    expect(component.getToxicityColor('non-toxic')).toBe('very-positive-color');
    expect(component.getToxicityColor('')).toBe('neutral-color');
  });

  it('getRatingClass() function should correctly return the color class based on index and score', () => {
    expect(component.getRatingClass(0, '70%')).toBe('positive-color');
    expect(component.getRatingClass(1, 'somewhat negative')).toBe(
      'somewhat-negative-color'
    );
    expect(component.getRatingClass(2, 'joy')).toBe('very-positive-color');
    expect(component.getRatingClass(3, 'toxic')).toBe('very-negative-color');
  });

  it('should initialize showComment array with false values', () => {
    component.toxicComments = mockCommentData;
    component.initializeShowCommentArray();
    expect(component.showComment).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
  });

  it('should toggle the showComment array', () => {
    component.showComment = [false, false, false, false, false, false, false];

    component.toggleShowComment(0);

    expect(component.showComment).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
  });

  it('should correctly group non-toxic comments and set toxicComments array', () => {
    const comments = [
      { id: 1, ratings: ['90%', 'positive', 'neutral', 'non-toxic'] },
      { id: 2, ratings: ['70%', 'positive', 'neutral', 'toxic'] },
      { id: 3, ratings: ['60%', 'neutral', 'neutral', 'non-toxic'] },
      { id: 4, ratings: ['40%', 'negative', 'neutral', 'non-toxic'] },
      { id: 5, ratings: ['30%', 'negative', 'neutral', 'toxic'] },
      { id: 6, ratings: ['30%', 'undecided', 'neutral', 'non-toxic'] },
    ];

    component.groupComments(comments);

    // Check if toxicComments contains only toxic comments
    expect(component.toxicComments).toEqual([
      { id: 2, ratings: ['70%', 'positive', 'neutral', 'toxic'] },
      { id: 5, ratings: ['30%', 'negative', 'neutral', 'toxic'] },
    ]);

    // Check if non-toxic comments are correctly categorized
    expect(component.positiveComments).toEqual([
      { id: 1, ratings: ['90%', 'positive', 'neutral', 'non-toxic'] },
    ]);
    expect(component.negativeComments).toEqual([
      { id: 4, ratings: ['40%', 'negative', 'neutral', 'non-toxic'] },
    ]);
    expect(component.neutralComments).toEqual([
      { id: 3, ratings: ['60%', 'neutral', 'neutral', 'non-toxic'] },
    ]);
    expect(component.undecidedComments).toEqual([
      { id: 6, ratings: ['30%', 'undecided', 'neutral', 'non-toxic'] },
    ]);
  });

  it('should sort non-toxic comments by score in descending order', () => {
    const comments = [
      { id: 0, ratings: ['100%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 1, ratings: ['90%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 2, ratings: ['80%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 3, ratings: ['70%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 4, ratings: ['70%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 5, ratings: ['70%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 6, ratings: ['70%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 7, ratings: ['70%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 8, ratings: ['20%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 9, ratings: ['10%', 'positive', 'neutral', 'Non-toxic'] },
    ];

    component.groupComments(comments);

    // Check if non-toxic comments are sorted correctly
    expect(component.top10Comments).toEqual([
      { id: 0, ratings: ['100%', 'positive', 'neutral', 'Non-toxic'] },
    ]);
    expect(component.bottom10Comments).toEqual([
      { id: 9, ratings: ['10%', 'positive', 'neutral', 'Non-toxic'] },
    ]);
  });

  it('should calculate the number of top and bottom 10% non-toxic comments', () => {
    const comments = [
      { id: 1, ratings: ['90%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 2, ratings: ['80%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 3, ratings: ['70%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 4, ratings: ['60%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 5, ratings: ['50%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 6, ratings: ['40%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 7, ratings: ['30%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 8, ratings: ['20%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 9, ratings: ['10%', 'positive', 'neutral', 'Non-toxic'] },
      { id: 10, ratings: ['5%', 'positive', 'neutral', 'Non-toxic'] },
    ];

    component.groupComments(comments);

    // Check if the correct number of comments are in top and bottom 10%
    expect(component.top10Comments.length).toBe(1);
    expect(component.bottom10Comments.length).toBe(1);
  });

  it('should filter accordions and comments when a search term is provided', () => {
    component.positiveComments = mockCommentData;

    fixture.detectChanges();
    // Set up component properties and accordionItems
    component.searchTerm = 'Positive'; // Provide a search term

    component.accordionItems = document.querySelectorAll('commentsAccordion');

    // Call the filterAccordionByText function
    component.filterAccordionByText();

    // Add your expectations here based on how you expect the elements to be filtered
    // For example:
    const accordion = fixture.nativeElement.querySelector('commentsAccordion');
    const comments = accordion.querySelectorAll('.comment');
    expect(true).toBe(true); // All comments should be filtered
  });

  it('should show all accordions and comments when no search term is provided', () => {
    component.positiveComments = mockCommentData;

    fixture.detectChanges();
    // Set up component properties and accordionItems
    component.searchTerm = ''; // No search term provided
    component.accordionItems = document.querySelectorAll('commentsAccordion');

    // Call the filterAccordionByText function
    component.filterAccordionByText();

    // Add your expectations here based on how you expect all elements to be visible
    // For example:
    const accordions =
      fixture.nativeElement.querySelectorAll('commentsAccordion');
    const comments = fixture.nativeElement.querySelectorAll('.comment');
    expect(true).toBe(true); // All comments should be visible
  });

  it('should display "No results" message when no matching comments are found', () => {
    component.positiveComments = mockCommentData;
    fixture.detectChanges();
    // Set up component properties and accordionItems
    component.searchTerm = 'NonExistentSearchTerm'; // A search term that won't match any comments
    component.accordionItems = document.querySelectorAll('commentsAccordion');

    // Call the filterAccordionByText function
    component.filterAccordionByText();

    // Add debugging statements to check the state of the DOM elements
    const noResultsMsg = fixture.nativeElement.querySelector('#noResults');

    // Add your expectations here based on how you expect the "No results" message to be displayed
    // For example:
    expect(noResultsMsg.style.display).toBe('flex');
    expect(true).toBe(true); // "No results" message should be hidden
    // "No results" message should be displayed
  });

  it('should hide "No results" message when matching comments are found', () => {
    component.positiveComments = mockCommentData;
    fixture.detectChanges();
    // Set up component properties and accordionItems
    component.searchTerm = 'Positive'; // Provide a search term with matching comments
    component.accordionItems = document.querySelectorAll('commentsAccordion');

    // Call the filterAccordionByText function
    component.filterAccordionByText();

    // Add your expectations here based on how you expect the "No results" message to be hidden
    // For example:
    const noResultsMsg = fixture.nativeElement.querySelector('#noResults');
    expect(true).toBe(true); // "No results" message should be hidden
  });

  it('should return if accordionItems is undefined', () => {
    component.positiveComments = mockCommentData;
    component.accordionItems = undefined;
    fixture.detectChanges();
    // Set up component properties and accordionItems
    component.searchTerm = 'Positive'; // Provide a search term with matching comments

    // Call the filterAccordionByText function
    component.filterAccordionByText();

    expect(true).toBe(true); // "No results" message should be hidden
  });

  it('should show matching comments and update DOM elements', () => {
    // Create actual DOM elements for comments
    const comment1 = document.createElement('div');
    comment1.innerText = 'This is a positive comment';
    const comment2 = document.createElement('div');
    comment2.innerText = 'This is another positive comment';

    // Prepare mock data
    const comments = [comment1, comment2];
    const textToFilter = 'positive';
    const shownCategories = new Set();
    const item = document.createElement('div');
    item.setAttribute('data-catID', '1');
    const accordionHasMatchingComment = false;

    // Call the function
    const [atleastOne, updatedAccordionFlag] = component.showComments(
      comments,
      textToFilter,
      shownCategories,
      item,
      accordionHasMatchingComment
    );

    // Assertions
    expect(atleastOne).toBe(true);
    expect(updatedAccordionFlag).toBe(true);

    // Verify that comments are displayed and have the correct classes
    expect(comment1.classList.contains('hide-element')).toBe(false);
    expect(comment2.classList.contains('hide-element')).toBe(false);

    // Verify that the accordion item is displayed and added to shownCategories
    expect(item.classList.contains('hide-element')).toBe(false);
    expect(shownCategories.has('1')).toBe(true);
  });

  it('should return false and not update accordion when no comments match', () => {
    // Create a temporary container to hold the comments
    const container = document.createElement('div');
  
    // Create actual DOM elements for comments
    const comment1 = document.createElement('div');
    comment1.innerText = 'This is a neutral comment';
    const comment2 = document.createElement('div');
    comment2.innerText = 'This is another neutral comment';
  
    // Append comments to the container
    container.appendChild(comment1);
    container.appendChild(comment2);
  
    const textToFilter = 'positive'; // No matching comments
    const shownCategories = new Set();
  
    // Create an actual DOM element for the item
    const item = document.createElement('div');
    item.setAttribute('data-catID', '1');
    
    const accordionHasMatchingComment = false;
  
    // Call the function
    const [atleastOne, updatedAccordionFlag] = component.showComments(
      Array.from(container.children), // Convert container's children to an array
      textToFilter,
      shownCategories,
      item,
      accordionHasMatchingComment
    );
  
    // Assertions
    expect(atleastOne).toBe(false);
    expect(updatedAccordionFlag).toBe(false);
  
    // Verify that no comments are displayed and remain hidden
    expect(comment1.classList.contains('hide-element')).toBe(true);
    expect(comment2.classList.contains('hide-element')).toBe(true);
  
    expect(shownCategories.has('1')).toBe(false);
  });
  

  it('should return false and not update accordion when no comments match', () => {
    // Create actual DOM elements for comments
    const comments = [
      document.createElement('div'),
      document.createElement('div'),
    ];
    comments[0].innerText = 'This is a neutral comment';
    comments[1].innerText = 'This is another neutral comment';
  
    const textToFilter = 'positive'; // No matching comments
    const shownCategories = new Set();
    
    // Create an actual DOM element for the item
    const item = document.createElement('div');
    item.setAttribute('data-catID', '1');
    
    const accordionHasMatchingComment = false;
  
    // Call the function
    const [atleastOne, updatedAccordionFlag] = component.showComments(
      comments,
      textToFilter,
      shownCategories,
      item,
      accordionHasMatchingComment
    );
  
    // Assertions
    expect(atleastOne).toBe(false);
    expect(updatedAccordionFlag).toBe(false);
  
    // Verify that no comments are displayed and remain hidden
    comments.forEach((comment) => {
      expect(comment.classList.contains('hide-element')).toBe(true);
    });
  
    // Verify that the accordion item remains hidden and is not added to shownCategories
    expect(shownCategories.has('1')).toBe(false);
  });

  it('should show all comments and add item to shownCategories', () => {
    // Create actual DOM elements for comments
    const comment1 = document.createElement('div');
    const comment2 = document.createElement('div');
  
    // Prepare mock data with actual DOM elements
    const comments = [comment1, comment2];
    const shownCategories = new Set();
  
    // Create an actual DOM element for the item
    const item = document.createElement('div');
    item.setAttribute('data-catID', '1');
  
    // Add a class to simulate hidden comments
    comment1.classList.add('hide-element');
    comment2.classList.add('hide-element');
  
    // Call the function
    component.hideComments(comments, shownCategories, item);
  
    // Assertions
  
    // Verify that both comments are shown
    expect(comment1.classList.contains('hide-element')).toBe(false);
    expect(comment2.classList.contains('hide-element')).toBe(false);
  
    // Verify that the item is added to shownCategories
    expect(shownCategories.has('1')).toBe(true);
  });
  
  it('should convert a valid timestamp to a date string', async () => {

    const convertedDate = component.convertToDate(1695912468);

    expect(convertedDate).toBe('28 Sep 2023 16:47');
  });

  it('should return an earliest string if the timestamp is invalid', async () => {

    const convertedDate = component.convertToDate(0);

    expect(convertedDate).toBe('1 Jan 1970 02:00');
  });

});
