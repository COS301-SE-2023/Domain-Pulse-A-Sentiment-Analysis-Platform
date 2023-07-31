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
  
  it('should set transition and modal display after modalDisplay value is set', (done: DoneFn) => {
    component.modalDisplay = true;
    expect(component.transition).toBeTrue();
    expect(component._modalDisplay).toBeTrue();
  
    component.modalDisplay = false;
    expect(component.transition).toBeFalse();
    expect(component._modalDisplay).toBeTrue();
    setTimeout(() => {
      expect(component._modalDisplay).toBeFalse();
      done();
    }, 400);
  });
});

