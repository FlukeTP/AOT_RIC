import { Component, OnInit } from '@angular/core';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css']
})
export class DatepickerComponent implements OnInit {

  formatDate: any = {
    dateInputFormat: 'DD/MM/YYYY'
  }
  minDate = new Date();
  maxDate = new Date();

  txtPicker : string = `

  List : https://valor-software.com/ngx-bootstrap/#/datepicker

  <input 
        type="text" 
        class="form-control form-control-sm" 
        placeholder="dd/MM/yyyy" 
        bsDatepicker 
        [bsConfig]="formatDate" 
       
        [maxDate]="maxDate">`
  constructor() { }

  ngOnInit() {
  }
}
