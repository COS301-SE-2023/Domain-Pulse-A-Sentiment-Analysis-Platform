import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalContainerComponent } from './modal-container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { first } from 'rxjs';

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

  it('should fire closed event when the close button is clicked', () => {
    let fired = false;
    component.close.pipe(first()).subscribe(() => (fired = true));

    component.closeModal();
    expect(fired).toBeTrue();
  });
});
