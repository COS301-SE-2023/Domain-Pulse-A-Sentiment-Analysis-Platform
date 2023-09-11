import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective {
  private tooltip: HTMLDivElement;
  private hoverTimeout: any;
  private isMouseInsideTooltip = false;
  private tooltipTimeout: any;



  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.tooltip = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltip, 'tooltip');
  }

  @Input('tooltip') tooltipText: string = '';
  @Input() tooltipPosition: string = 'right'; // Default position is right
  @Input('mul') tooltipMargin: number = 1.0; 

 /*  @HostListener('mouseenter', ['$event']) onMouseEnter(event: MouseEvent) {

    
  }

  @HostListener('mouseenter', ['$event']) onTooltipMouseEnter(event: MouseEvent) {
    this.isMouseInsideTooltip = true;

    console.log('mouse enter2');

    this.hoverTimeout = setTimeout(() => {
    this.renderer.setStyle(this.tooltip, 'background-color', 'rgba(3, 127, 255, 0.7)');
    this.renderer.setStyle(this.tooltip, 'color', '#e0efff');
    this.renderer.setStyle(this.tooltip, 'padding', '20px');
    //create shadow behind the tooltip
    this.renderer.setStyle(this.tooltip, 'box-shadow', '0 0 10px rgba(0, 0, 0, 0.3)');
    // set width
    this.renderer.setStyle(this.tooltip, 'width', '250px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '35px');
    this.renderer.setStyle(this.tooltip, 'opacity', '1');
    this.renderer.setStyle(this.tooltip, 'transform', 'translateX(0)');
    this.renderer.setStyle(this.tooltip, 'transition', 'opacity 1500ms ease-in, transform 1500ms ease-in');
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'z-index', '11');

    this.tooltip.textContent = this.tooltipText;

    const icon = this.renderer.createElement('img');
    this.renderer.setAttribute(icon, 'src', "../assets/icons/tooltip.svg"); // Add your icon classes here

    const link = this.renderer.createElement('a');
    this.renderer.setAttribute(link, 'href', 'http://localhost:4200/help'); 
    this.renderer.setAttribute(link, 'target', '_blank'); // Set your link URL here
    link.textContent = 'need more help?';

    // Append the icon and link to the tooltip

    this.renderer.appendChild(this.tooltip, link);
    this.renderer.appendChild(document.body, this.tooltip);
    this.updateTooltipPosition();

    }, 1000);

  }

  @HostListener('mouseleave', ['$event']) onTooltipMouseLeave(event: MouseEvent) {
    this.isMouseInsideTooltip = false;
    // Add a delay before hiding the tooltip
    setTimeout(() => {
      this.hideTooltip();
    }, 1000);

    console.log('mouse leave');
  }

  @HostListener('mouseleave', ['$event']) onMouseLeave(event: MouseEvent) {

    console.log('mouse leave2');
    if (!this.isMouseInsideTooltip) {
      this.hideTooltip();
    }
     this.renderer.setStyle(this.tooltip, 'opacity', '0');
    this.renderer.setStyle(this.tooltip, 'transform', 'translateX(-20px)');
    this.tooltip.textContent = '';
    this.renderer.removeChild(this.el.nativeElement, this.tooltip); 
  } */

  private showTooltip() {
    clearTimeout(this.tooltipTimeout);
    this.hoverTimeout = setTimeout(() => {
      this.renderer.setStyle(this.tooltip, 'background-color', 'rgba(3, 127, 255, 0.7)');
      this.renderer.setStyle(this.tooltip, 'color', '#e0efff');
      this.renderer.setStyle(this.tooltip, 'padding', '20px');
      //create shadow behind the tooltip
      this.renderer.setStyle(this.tooltip, 'box-shadow', '0 0 10px rgba(0, 0, 0, 0.3)');
      // set width
      this.renderer.setStyle(this.tooltip, 'width', '250px');
      this.renderer.setStyle(this.tooltip, 'border-radius', '35px');
      this.renderer.setStyle(this.tooltip, 'opacity', '1');
      this.renderer.setStyle(this.tooltip, 'transform', 'translateX(0)');
      this.renderer.setStyle(this.tooltip, 'transition', 'opacity 1500ms ease-in, transform 1500ms ease-in');
      this.renderer.setStyle(this.tooltip, 'position', 'absolute');
      this.renderer.setStyle(this.tooltip, 'z-index', '11');
  
      this.tooltip.textContent = this.tooltipText;
  
      const icon = this.renderer.createElement('img');
      this.renderer.setAttribute(icon, 'src', "../assets/icons/tooltip.svg"); // Add your icon classes here
  
      const link = this.renderer.createElement('a');
      this.renderer.setAttribute(link, 'href', 'http://localhost:4200/help'); 
      this.renderer.setAttribute(link, 'target', '_blank'); // Set your link URL here
      link.textContent = 'need more help?';

      this.renderer.listen(link, 'click', (event) => {

        this.hideTooltip();
      });
  
      // Append the icon and link to the tooltip
  
      this.renderer.appendChild(this.tooltip, link);
      this.renderer.appendChild(document.body, this.tooltip);
      this.updateTooltipPosition();
  
      }, 1000);

    // Add a mouseleave event listener to the tooltip
    this.renderer.listen(this.tooltip, 'mouseleave', () => {
      this.hideTooltip();
    });
  }

  @HostListener('mouseenter', ['$event']) onMouseEnter(event: MouseEvent) {
    this.tooltipTimeout = setTimeout(() => {
      this.showTooltip();
    }, 1000);
  }

  private hideTooltip() {
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