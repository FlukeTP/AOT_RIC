import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { DecimalFormat } from '../helper/decimalformat';

@Directive({ selector: '[numberOnly]' })
export class NumberDirective {

    @Input() dash: boolean = false;

    @Input() dot: boolean = false;

    constructor(private el: ElementRef) { }

    @HostListener("keypress", ['$event'])
    onkeypress(e) {
        let theEvent = e || window.event;
        let key;
        // Handle paste
        if (theEvent.type === 'paste') {
            key = theEvent.clipboardData.getData('text/plain');
        } else {
            // Handle key press
            key = theEvent.keyCode || theEvent.which;
            key = String.fromCharCode(key);
        }

        // if has dot (.) to prevent double dot example (..)
        let regexDot = /\./;
        if (regexDot.test(key)) {
            if (this.el.nativeElement.value && this.dot) {
                if (this.el.nativeElement.value.search(/\./g) != -1) {
                    // theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            } else {
                theEvent.returnValue = false;
                if (theEvent.preventDefault) theEvent.preventDefault();
            }
        }

        let regexDash = /[-]/;
        if (regexDash.test(key)) {
            if (this.el.nativeElement.value) {
                theEvent.returnValue = false;
                if (theEvent.preventDefault) theEvent.preventDefault();
            }
        }
        let regex = /[0-9-]|\./;
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }

    @HostListener("blur", ['$event'])
    onblur(e) {
        let format = this.dot ? "###,###.00" : "###,###"
        const df = new DecimalFormat(format);
        if (this.el.nativeElement.value) {
            this.el.nativeElement.value = df.format(this.el.nativeElement.value);
        } else {
            this.el.nativeElement.value = df.format(0)
        }
    }

    @HostListener("focus", ['$event'])
    onfocus(e) {
        if (this.el.nativeElement.value) {
            let temp: string = this.el.nativeElement.value.replace(/,/g, '');
            /* _____________ check dot = .00 _____________ */
            if (this.el.nativeElement.value.includes(".")) {
                let valueSplitDot = this.el.nativeElement.value.split(".");
                if (valueSplitDot[1].substring(0, 2) === "00") {
                    temp = valueSplitDot[0].replace(/,/g, '');
                }
            }
            this.el.nativeElement.value = temp;
        } else {
            this.el.nativeElement.value = 0;
        }
    }
}