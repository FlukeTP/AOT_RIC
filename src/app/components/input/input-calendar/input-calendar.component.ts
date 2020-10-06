import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BsDatepickerViewMode, BsDatepickerConfig } from 'ngx-bootstrap/datepicker/ngx-bootstrap-datepicker';

@Component({
  selector: 'input-calendar',
  templateUrl: './input-calendar.component.html',
  styleUrls: ['./input-calendar.component.css']
})
export class InputCalendarComponent implements OnInit {
  @Input() wording: string = 'เพิ่มข้อมูล';
  @Input() format: string = 'dd/MM/yyyy';
  @Input() default: boolean = true;
  @Input() isInvalid: boolean = false;
  @Output() changeDate: EventEmitter<string> = new EventEmitter();

  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig>;
  public bsInlineValue;
  constructor(public datepipe: DatePipe) { }

  ngOnInit() {
    this.bsInlineValue = this.default ? new Date() : '';
    if (this.format === 'MM/yyyy') {
      this.bsConfig = Object.assign({}, {
        minMode: this.minMode,
        // dateInputFormat: this.format
      });
    } else if (this.format === 'yyyy') {
      this.minMode = 'year';
      this.bsConfig = Object.assign({}, {
        minMode: this.minMode
      });
    }
  }

  onDateChange(event) {
    let val = this.datepipe.transform(event, this.format)
    this.changeDate.emit(val);
  }

  setDate(val) {
    this.bsInlineValue = this.toDate(val);
  }

  private toDate(dateStr) {
    const [day, month, year] = dateStr.split(/[-\/.]/);
    return new Date(year, month - 1, day);
  }

}
