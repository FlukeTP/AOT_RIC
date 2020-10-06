import { Component, OnInit } from '@angular/core';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  providers:[AlertService]
})
export class AlertComponent implements OnInit {

  constructor(
    private alertService : AlertService
  ) { }

  ngOnInit() {
  }

}
