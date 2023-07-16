import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsViewComponent } from './comments-view.component';

describe('CommentsViewComponent', () => {
  let component: CommentsViewComponent;
  let fixture: ComponentFixture<CommentsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentsViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
