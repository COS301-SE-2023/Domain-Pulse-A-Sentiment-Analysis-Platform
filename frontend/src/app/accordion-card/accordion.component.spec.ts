import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccordionComponent } from './accordion.component';
import { AccordionItem } from './directives/accordion-item.directive';
import { NO_ERRORS_SCHEMA, QueryList } from '@angular/core';

describe('AccordionComponent', () => {
  let component: AccordionComponent;
  let fixture: ComponentFixture<AccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccordionComponent, AccordionItem],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [BrowserAnimationsModule], 
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle state', () => {
    const index = 0;
    component.toggleState(index);
    expect(component.expanded.has(index)).toBeTrue();
    component.toggleState(index);
    expect(component.expanded.has(index)).toBeFalse();
  });

  it('should toggle state with collapsing enabled', () => {
    component.collapsing = true;
    const index1 = 0;
    const index2 = 1;

    component.toggleState(index1);
    expect(component.expanded.has(index1)).toBeTrue();
    component.toggleState(index2);
    expect(component.expanded.has(index1)).toBeFalse();
  });

  it('should toggle state with collapsing disabled', () => {
    component.collapsing = false;
    const index1 = 0;
    const index2 = 1;

    component.toggleState(index1);
    expect(component.expanded.has(index1)).toBeTrue();
    component.toggleState(index2);
    expect(component.expanded.has(index2)).toBeTrue();
  });

  it('should set categoryID', () => {
    const categoryId = '123';
    component.categoryID = categoryId;
    expect(component.categoryID).toEqual(categoryId);
  });

  it('should getToggleState', () => {
    const index = 0;
    const toggleStateFn = component.getToggleState(index);
    expect(typeof toggleStateFn).toBe('function');
    toggleStateFn();
    expect(component.expanded.has(index)).toBeTrue();
  });

  it('should handle ngAfterViewInit', () => {
    const items = new QueryList<AccordionItem>();
    const item1 = new AccordionItem();
    item1.expanded = true;
    const item2 = new AccordionItem();
    items.reset([item1, item2]);
    component.items = items;

    spyOn(component, 'toggleState').and.callThrough();
    component.ngAfterViewInit();
    expect(component.toggleState).toHaveBeenCalledTimes(0);
    expect(component.expanded.has(0)).toBeTrue();
    expect(component.expanded.has(1)).toBeFalse();
  });

  
});
