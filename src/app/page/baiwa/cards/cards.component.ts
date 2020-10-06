import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  constructor(
  ) { }

  cardHeader: string = `
        Ts : import  CardsComponent

        <app-card header="Title">
            <p>content</p>
        </app-card>`

  cardBody: string = `
        Ts : import  CardsComponent

        <app-card>
            <p>content</p>
        </app-card>`
  ngOnInit() {   
  }

}
