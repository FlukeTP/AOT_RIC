import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.css']
})
export class CardHeaderComponent implements OnInit {

  @Input() header : string = '';
  @Input() isButton : string = 'false';
  @Input() classButton : string = '';
  @Input() urlButton : string = '';
  @Input() textButton : string = '';
  constructor() { }

  ngOnInit() {
  }

}
