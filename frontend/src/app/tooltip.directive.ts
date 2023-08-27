import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective {
  private tooltip: HTMLDivElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.tooltip = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltip, 'tooltip');
  }

  @Input('tooltip') tooltipText: string = '';
  @Input() tooltipPosition: string = 'right'; // Default position is right

  @HostListener('mouseenter') onMouseEnter() {
    this.updateTooltipPosition();
    this.renderer.setStyle(this.tooltip, 'background-color', '#333');
    this.renderer.setStyle(this.tooltip, 'color', 'white');
    this.renderer.setStyle(this.tooltip, 'padding', '10px');
    // set width
    this.renderer.setStyle(this.tooltip, 'width', '150px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '20px');
    this.renderer.setStyle(this.tooltip, 'opacity', '1');
    this.renderer.setStyle(this.tooltip, 'transform', 'translateX(0)');
    this.renderer.setStyle(this.tooltip, 'transition', 'opacity 300ms ease-in, transform 300ms ease-in');
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    
    // Position the tooltip to the right of the element
    // this.renderer.setStyle(this.tooltip, 'top', rect.top - 40 + 'px');
    // this.renderer.setStyle(this.tooltip, 'left', rect.right + 'px');
    this.updateTooltipPosition();

    this.tooltip.textContent = this.tooltipText;
    this.renderer.appendChild(document.body, this.tooltip);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.tooltip, 'opacity', '0');
    this.renderer.setStyle(this.tooltip, 'transform', 'translateX(-20px)');
    this.tooltip.textContent = '';
    this.renderer.removeChild(this.el.nativeElement, this.tooltip);
  }

  private updateTooltipPosition() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    console.log("left", rect.left);
    console.log("top", rect.top);
    console.log("width", rect.width);
    console.log("height", rect.height);
    switch (this.tooltipPosition) {
      case 'top':
        this.renderer.setStyle(this.tooltip, 'top', rect.top - 40 + 'px');
        this.renderer.setStyle(this.tooltip, 'left', rect.left + rect.width / 2 + 'px');
        break;
      case 'right':
        this.renderer.setStyle(this.tooltip, 'top', rect.top - 40 + 'px');
        this.renderer.setStyle(this.tooltip, 'left', rect.right + 'px');
        break;
      case 'bottom':
        this.renderer.setStyle(this.tooltip, 'top', rect.bottom + 'px');
        this.renderer.setStyle(this.tooltip, 'left', rect.left + rect.width / 2 + 'px');
        break;
      case 'left':
        this.renderer.setStyle(this.tooltip, 'top', rect.top - 40 + 'px');
        this.renderer.setStyle(this.tooltip, 'left', rect.left - rect.width - 150  + 'px');
        break;
    }
  }
}