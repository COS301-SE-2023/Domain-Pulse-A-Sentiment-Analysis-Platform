import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective {
  private tooltip: HTMLDivElement;
  private hoverTimeout: any;
  private isMouseInsideTooltip = false;
  private tooltipTimeout: any;
  private currHost= window.location.host;

  

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.tooltip = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltip, 'tooltip');
  }

  @Input('tooltip') tooltipText: string = '';
  @Input() tooltipPosition: string = 'right'; // Default position is right
  @Input('mul') tooltipMargin: number = 1.0;
  @Input() searchTerm: string | undefined;

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

    /* display: flex
    flex-direction: column */
      this.renderer.setStyle(this.tooltip, 'display', 'flex');
      this.renderer.setStyle(this.tooltip, 'flex-direction', 'column');
      this.renderer.setStyle(this.tooltip, 'background-color', 'rgba(3, 127, 255, 0.9)');
      this.renderer.setStyle(this.tooltip, 'color', '#e0efff');
      this.renderer.setStyle(this.tooltip, 'padding', '20px');
      //create shadow behind the tooltip
      this.renderer.setStyle(this.tooltip, 'box-shadow', '0 0 10px rgba(0, 0, 0, 0.3)');
      // set width
      this.renderer.setStyle(this.tooltip, 'width', 'fit-content');
      this.renderer.setStyle(this.tooltip, 'max-width', '300px');
      this.renderer.setStyle(this.tooltip, 'border-radius', '35px');
      this.renderer.setStyle(this.tooltip, 'opacity', '1');
      this.renderer.setStyle(this.tooltip, 'transform', 'translateX(0)');
      this.renderer.setStyle(this.tooltip, 'transition', 'opacity 1500ms ease-in, transform 1500ms ease-in');
      this.renderer.setStyle(this.tooltip, 'position', 'absolute');
      this.renderer.setStyle(this.tooltip, 'z-index', '11');
  
      //this.tooltip.textContent = this.tooltipText;

      /* display: flex
    flex-direction: row */
      const div = this.renderer.createElement('div');
      this.renderer.setStyle(div, 'display', 'flex');
      this.renderer.setStyle(div, 'flex-direction', 'row');
      
      const p = this.renderer.createElement('p');

      p.textContent = this.tooltipText;

      const br = this.renderer.createElement('br');

  
      const icon = this.renderer.createElement('img');
      this.renderer.setAttribute(icon, 'src', "../assets/icons/tooltip-info.png");
      this.renderer.setStyle(icon, 'margin-right', '10px');
      this.renderer.setStyle(icon, 'width', '20px');
      this.renderer.setStyle(icon, 'height', '20px');


      const link = this.renderer.createElement('a');
      console.log(this.currHost);
      this.renderer.setAttribute(link, 'href', 'http://' + this.currHost + '/help' + (this.searchTerm? (`?q=${this.searchTerm}`): ""));
      this.renderer.setAttribute(link, 'target', '_blank'); 
      this.renderer.setStyle(link, 'color', 'white');
      this.renderer.setStyle(link, 'font-size', '0.8rem');

      link.textContent = 'need more help?';

      this.renderer.listen(link, 'click', (event) => {

        this.hideTooltip();
      });
  
      this.renderer.appendChild(div, icon);
      this.renderer.appendChild(p, br);
      this.renderer.appendChild(p, link);
      this.renderer.appendChild(div, p);
      this.renderer.appendChild(this.tooltip, div);
  

      this.renderer.appendChild(document.body, this.tooltip);
      this.updateTooltipPosition();

      this.renderer.addClass(this.tooltip, 'show');


    this.renderer.listen(this.tooltip, 'mouseleave', () => {
      this.hideTooltip();
    });

    this.renderer.listen(this.tooltip, 'mouseenter', () => {
      this.isMouseInsideTooltip = true;
    });

  }

  @HostListener('mouseenter', ['$event']) onMouseEnter(event: MouseEvent) {
    this.tooltipTimeout = setTimeout(() => {
      this.showTooltip();
    }, 1000);
  }

  @HostListener('mouseleave', ['$event']) onMouseLeave(event: MouseEvent) {
    clearTimeout(this.tooltipTimeout);
    this.isMouseInsideTooltip = false;
    setTimeout(() => {
      if(!this.isMouseInsideTooltip){
        this.hideTooltip();
      }
  }, 0);
  }


  private hideTooltip() {

    this.renderer.removeClass(this.tooltip, 'show');


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