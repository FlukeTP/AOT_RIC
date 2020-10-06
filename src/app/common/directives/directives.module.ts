import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NumberDirective } from './number.directive';

@NgModule({
    imports: [CommonModule],
    declarations: [
        NumberDirective
    ],
    exports: [
        NumberDirective
    ]
})
export class DirectivesModule { }
