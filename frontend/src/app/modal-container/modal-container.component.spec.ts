import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalContainerComponent } from './modal-container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ModalContainerComponent', () => {
  let component: ModalContainerComponent;
  let fixture: ComponentFixture<ModalContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      declarations: [ModalContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
