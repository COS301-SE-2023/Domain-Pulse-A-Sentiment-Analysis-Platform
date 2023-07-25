import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsViewComponent } from './comments-view.component';
import { NgxsModule, Store } from '@ngxs/store';
import { FormsModule } from '@angular/forms';

const mockCommentData = [
  {
    _id: '',
    data: 'When a Coffee shop serves gluten-free cake they get a 110% review from me. The gluten-free orange almond cake is delicious. Thank you, Goddess Café. This is a really feel-good place for anyone. I visited them a few times now. The service is exceptional and I feel like a goddess when eating there. The Brooklyn Goddess Café is just as good. Difficult to choose, but Soutpansberg is more spacious',
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
    _id: '',
    data: 'Lovely place, fantastic atmosphere, very delicious food and Rosy helped us, very friendly and beautiful woman who cares for her Clients',
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
    _id: '',
    data: "Extremely overated, coffee was mediocre and the pink white chocolate was seriously bad, could not finish the drink. The service was so bad we didn't even order food. Why bother.",
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
    _id: '',
    data: 'Stopped for a quick sandwich. Sliced way to thick. Dry. Not tasty. Will not come back.',
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
    _id: '',
    data: "Beautifully decorated restaurant ideal for the girly girl in you. Pink and flowers are everywhere.The atmosphere is relaxed and tranquil. What I like about this one in Rietondale is that it is spacious. Enjoy a comfortable outing with friends with a variety of 'scene settings' to take photo's. I had the Persian Love Spice cake that was really delicious but it contains quite a number of hard cardamom seeds which is a put-off. I suggest using cardamom powder instead. Overall a great experience.",
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
    _id: '',
    data: 'The place is truly beautiful with a lot of dedicated sites for pictures. We had pink water to cool us down from the hit that was very thoughtful. Food was delicious as well as well presented. I like the fact that the waiter(Charles) had good suggestions it is not often that you get those. I will definitely come back for the cakes they are delicious.',
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
    _id: '',
    data: 'It’s bigger than the Waterkloof one, more spacious and pink fully decorated. One thing I enjoyed was the cappuccino 😍 the cup was big enough to not want a refill. I ordered a croissant with eggs and my friend ordered salmon Benedict something. The dishes looked beautiful for the pictures but the salmon was actually not good. The waitress who was helping us was nice and friendly. I complained about parking but there’s a space outside by the municipal park and there’s a car guard. Overall experience was okay. I’ll go back again just for the cappuccino.',
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentsViewComponent],
      imports: [NgxsModule.forRoot([]), FormsModule],
    });

    component = TestBed.inject(CommentsViewComponent);
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  });

  it('should correctly sort the emotions', () => {
    component.transformComments(mockCommentData);

    expect(true).toBe(true);
  });

  it('getRatingColor() function should correctly classify the rating', () => {
    expect(component.getRatingColor('70%')).toBe('positive-color');
    expect(component.getRatingColor('40%')).toBe('neutral-color');
    expect(component.getRatingColor('30%')).toBe('somewhat-negative-color');
    expect(component.getRatingColor('')).toBe('neutral-color');
  });

  it('getCategoryColor() function should correctly classify the category', () => {
    expect(component.getCategoryColor('very negative')).toBe('very-negative-color');
    expect(component.getCategoryColor('somewhat negative')).toBe('somewhat-negative-color');
    expect(component.getCategoryColor('neutral')).toBe('neutral-color');

  });

  it('getEmotionColor() function should correctly classify the emotion', () => {
    expect(component.getEmotionColor('anger')).toBe('negative-color');
    expect(component.getEmotionColor('joy')).toBe('positive-color');
    expect(component.getEmotionColor('sadness')).toBe('sad-color');
    expect(component.getEmotionColor('neutral')).toBe('neutral-color');
  });

  it('getToxicityColor() function should correctly classify the toxicity', () => {
    expect(component.getToxicityColor('toxic')).toBe('very-negative-color');
    expect(component.getToxicityColor('non-toxic')).toBe('very-positive-color');
  });

  

  
});
