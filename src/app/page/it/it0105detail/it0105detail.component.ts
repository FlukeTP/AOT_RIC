import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from 'src/app/_service/validate.service';
import { Utils } from 'src/app/common/helper';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { BsDatepickerViewMode } from 'ngx-bootstrap/datepicker/models';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker/public_api';
import { DatePipe } from '@angular/common';

const URL = {
  SAVE: "it0105/save",
  FIND_ID: "it0105/find_id"
}
@Component({
  selector: 'app-it0105detail',
  templateUrl: './it0105detail.component.html',
  styleUrls: ['./it0105detail.component.css']
})
export class It0105detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;
  @ViewChild('calendarYear') calendarYear: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "กำหนดอัตราค่าภาระ การใช้บริการ Staff Page และ Public Page",
      link: "#",
    }
  ];

  formGroup: FormGroup;
  minMode: BsDatepickerViewMode = 'year';
  bsConfig: Partial<BsDatepickerConfig> = { minMode: this.minMode };
  bsInlineValue: any;
  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    public datepipe: DatePipe,
    private validate: ValidateService
  ) {
    this.formGroup = this.fb.group({
      itPageConfigId: [""],
      annual: ["", Validators.required],
      effectiveDate: ["", Validators.required],
      serviceType: ["", Validators.required],
      chargeRate: ["", Validators.required],
      remark: ["", Validators.required],
    })
  }
  // =================== initial setting ==================
  ngOnInit() {
    this.formGroup.get('itPageConfigId').patchValue(this.route.snapshot.queryParams['itPageConfigId']);
    if (Utils.isNotNull(this.formGroup.get('itPageConfigId').value)) {
      this.findById(this.formGroup.get('itPageConfigId').value);
    }
  }
  // ================ action =====================
  dateChange(controlName: string, event) {
    this.formGroup.get(controlName).patchValue(event);
  }

  onDateChange(event) {
    let date = new Date(event);
    let val = this.datepipe.transform(date, "yyyy");
    this.formGroup.get('annual').patchValue(val);
  }

  onBack() {
    this.router.navigate(["/it/it010"], {
      queryParams: {
        tab: 5
      }
    })
  }

  onValidBeforeSave() {
    let validateData = [
      { format: "", header: "ประจำปี", value: this.formGroup.get("annual").value },
      { format: "", header: "วันที่มีผล", value: this.formGroup.get("effectiveDate").value },
      { format: "", header: "ประเภท", value: this.formGroup.get("serviceType").value },
      { format: "", header: "อัตราค่าภาระ", value: this.formGroup.get("chargeRate").value },
      { format: "", header: "หมายเหตุ", value: this.formGroup.get("remark").value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal(MessageService.MSG.REQUIRE_FIELD);
      } else {
        this.modalSave.openModal();
      }
    }
  }
  // ======================== call back-end ====================
  callSave() {
    this.commonService.loading();
    // console.log("formGroup => ", this.formGroup.value);
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/it/it010'], {
          queryParams: {
            tab: 5
          }
        });
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  findById(id) {
    this.commonService.loading();
    this.ajax.doPost(URL.FIND_ID, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.get('itPageConfigId').patchValue(res.data.itPageConfigId);
        this.formGroup.get('annual').patchValue(res.data.annual);
        $('input#pickerYear').val(this.formGroup.get('annual').value);
        this.formGroup.get('effectiveDate').patchValue(res.data.effectiveDate);
        this.calendar.setDate(this.formGroup.get('effectiveDate').value);
        this.formGroup.get('serviceType').patchValue(res.data.serviceType);
        this.formGroup.get('chargeRate').patchValue(res.data.chargeRate);
        this.formGroup.get('remark').patchValue(res.data.remark);
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/it/it010'], {
          queryParams: {
            tab: 5
          }
        });
      }
      this.commonService.unLoading();
    })
  }
}
