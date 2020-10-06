import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/components/notification/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  txtAlert : string = `

  Use
  constructor(
    private alertService : AlertService
  ) { }



  this.alertService.onAlertSeccess();

  this.alertService.onAlertDanger();

  this.alertService.onAlertWarning();
  `

  constructor(
    private alertService : AlertService
  ) { }

  ngOnInit() {
  }

  
  onAlertSuccess(){
    this.alertService.onAlertSeccess();
  }

  onAlertDanger(){
    this.alertService.onAlertDanger();
  }

  onAlertWarning(){
    this.alertService.onAlertWarning();
  }
}
