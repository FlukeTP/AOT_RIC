import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'pc-heaer',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() company: string = '';
  @Input() contract: string = '';
  @Input() username: string = '';
  @Input() fullname: string = '';
  constructor() { }
  isShown: boolean = true ; 
  isShown1: boolean = true ; 
  ngOnInit() {
  }
  toggleShow() {

    this.isShown = ! this.isShown;
    
    }
    toggleShow1() {

      this.isShown1 = ! this.isShown1;
      
      }
}
