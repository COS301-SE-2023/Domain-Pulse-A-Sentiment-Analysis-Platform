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
  @Input('mul') tooltipMargin: number = 1.0; 

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.tooltip, 'background-color', '#037fff');
    this.renderer.setStyle(this.tooltip, 'color', '#e0efff');
    this.renderer.setStyle(this.tooltip, 'padding', '10px');
    //create shadow behind the tooltip
    this.renderer.setStyle(this.tooltip, 'box-shadow', '0 0 10px rgba(0, 0, 0, 0.8)');
    // set width
    this.renderer.setStyle(this.tooltip, 'width', '150px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '20px');
    this.renderer.setStyle(this.tooltip, 'opacity', '1');
    this.renderer.setStyle(this.tooltip, 'transform', 'translateX(0)');
    this.renderer.setStyle(this.tooltip, 'transition', 'opacity 300ms ease-in, transform 300ms ease-in');
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'z-index', '11');
    

    this.tooltip.textContent = this.tooltipText;
    this.renderer.appendChild(document.body, this.tooltip);
    this.updateTooltipPosition();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.tooltip, 'opacity', '0');
    this.renderer.setStyle(this.tooltip, 'transform', 'translateX(-20px)');
    this.tooltip.textContent = '';
    this.renderer.removeChild(this.el.nativeElement, this.tooltip);
  }

  private updateTooltipPosition() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();

    const tooltipWidth = tooltipRect.width * this.tooltipMargin;
    const tooltipHeight = tooltipRect.height * this.tooltipMargin;

    switch (this.tooltipPosition) {
      case 'top':
        this.renderer.setStyle(this.tooltip, 'top', rect.top - tooltipHeight + 'px');
        this.renderer.setStyle(this.tooltip, 'left', rect.left + rect.width / 2 - tooltipRect.width / 2 + 'px');
        break;
      case 'right':
        this.renderer.setStyle(this.tooltip, 'top', rect.top + rect.height / 2 - tooltipRect.height / 2 + 'px');
        this.renderer.setStyle(this.tooltip, 'left', rect.right + tooltipWidth - tooltipRect.width + 'px');
        break;
      case 'bottom':
        this.renderer.setStyle(this.tooltip, 'top', rect.bottom + tooltipHeight - tooltipRect.height + 'px');
        this.renderer.setStyle(this.tooltip, 'left', rect.left + rect.width / 2 - tooltipRect.width / 2 + 'px');
        break;
      case 'left':
        this.renderer.setStyle(this.tooltip, 'top', rect.top + rect.height / 2 - tooltipRect.height / 2 + 'px');
        this.renderer.setStyle(this.tooltip, 'left', rect.left - tooltipWidth + 'px');
        break;
    }
  }
}