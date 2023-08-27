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

  @HostListener('mouseenter') onMouseEnter() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.renderer.setStyle(this.tooltip, 'background-color', '#333');
    this.renderer.setStyle(this.tooltip, 'color', 'white');
    this.renderer.setStyle(this.tooltip, 'padding', '10px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '20px');
    this.renderer.setStyle(this.tooltip, 'opacity', '1');
    this.renderer.setStyle(this.tooltip, 'transform', 'translateX(0)');
    this.renderer.setStyle(this.tooltip, 'transition', 'opacity 300ms ease-in, transform 300ms ease-in');
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'z-index', '11');
    
    // Position the tooltip to the right of the element
    this.renderer.setStyle(this.tooltip, 'top', rect.top - 40 + 'px');
    this.renderer.setStyle(this.tooltip, 'left', rect.right + 'px');

    this.tooltip.textContent = this.tooltipText;
    this.renderer.appendChild(document.body, this.tooltip);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.tooltip, 'opacity', '0');
    this.renderer.setStyle(this.tooltip, 'transform', 'translateX(-20px)');
    this.tooltip.textContent = '';
    this.renderer.removeChild(this.el.nativeElement, this.tooltip);
  }
}