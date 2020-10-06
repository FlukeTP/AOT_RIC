import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils, CheckNumber } from 'src/app/common/helper';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { NumberUtils } from 'src/app/common/helper/number';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';

const URL = {
  EXPORT: "download-template-info",
  GET_ALL: "firebrigade002/get_all",
  GET_HISTORY: 'firebrigade002/get_history',
}
@Component({
  selector: 'app-firebrigade002',
  templateUrl: './firebrigade002.component.html',
  styleUrls: ['./firebrigade002.component.css']
})
export class Firebrigade002Component implements OnInit {
  @ViewChild('modalRemark') modalRemark: ModalCustomComponent;
  @ViewChild('modalHistory') modalHistory: ModalCustomComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  breadcrumb: any = [
    {
      label: "หมวดดับเพลิง",
      link: "/home/firebrigade",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระจัดฝึกอบรมการดับเพลิงและกู้ภัย",
      link: "#",
    }
  ];

  remarkStr: string = '';
  formGroup: FormGroup;
  dataTable: any;
  dataTableHistory: any;
  dataList: any[] = [];
  dataListHistory: any[] = [];
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      courseName: [''],
      effectiveDate: ['']
    })
  }
  // ===================== Initial setting ============
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.formGroup.get('effectiveDate').patchValue('');
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }
  // =============== Action ======================
  dateChange(event) {
    this.formGroup.get('effectiveDate').patchValue(event);
  }

  onSearchCriteria() {
    this.getList();
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      data: this.dataList,
      columns: [
        {
          data: 'effectiveDate', className: 'text-center'
        }, {
          data: 'courseName', className: 'text-left'
        }, {
          data: 'chargeRates', className: 'text-right',
          render(data, type, row, meta) {
            return `${NumberUtils.numberToDecimalFormat(data)} บาท/${row.unit}`;
          }
        }, {
          data: 'createDate', className: 'text-center'
        }, {
          data: 'createdBy', className: 'text-left'
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            let _btn = `${ButtonDatatable.remark('remark')} ${ButtonDatatable.edit('edit')} ${ButtonDatatable.history('history')}`;
            return _btn;
          }
        }
      ]
    });
  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'button#remark', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.onClickRemark(data.remark);
    });

    this.dataTable.on('click', 'td > button#edit', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/firebrigade/firebrigade002detail'], {
        queryParams: {
          rateConfigId: data.rateConfigId
        }
      })
    });
    // history button
    this.dataTable.on('click', 'tbody tr button#history', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onOpenModalHistory(data.rateConfigId);
    });
  }

  onClickRemark(text: string) {
    this.remarkStr = text;
    this.modalRemark.openModal();
  }

  onOpenModalHistory(rateConfigId: string) {
    this.getHistory(rateConfigId);
    this.modalHistory.openModal(ModalCustomComponent.MODAL_SIZE.LARGE);
  }

  initDataTableHistory = () => {
    if (this.dataTableHistory != null) {
      this.dataTableHistory.destroy();
    }
    this.dataTableHistory = $('#datatableHistory').DataTable({
      ...this.commonService.configDataTable(),
      data: this.dataListHistory,
      columns: [
        {
          data: 'effectiveDate', className: 'text-left'
        }, {
          data: 'courseName', className: 'text-left'
        }, {
          data: 'chargeRates', className: 'text-right',
          render(data, type, row, meta) {
            return `${NumberUtils.numberToDecimalFormat(data)} บาท/คน`;
          }
        }, {
          data: 'createDate', className: 'text-left'
        }, {
          data: 'createdBy', className: 'text-left'
        }
      ],
    });
  }

  // =================== call back-end ===================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    Object.keys(this.formGroup.value).forEach(key => {
      if (this.formGroup.get(key).value !== "") {
        arrOfId.push(this.formGroup.get(key).value);
      } else {
        arrOfId.push("-");
      }

    });
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/FIREBRIGADE002/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  getHistory(rateConfigId: string) {
    let data = {
      rateConfigId: rateConfigId
    }
    this.ajax.doPost(URL.GET_HISTORY, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataListHistory = res.data;
        this.initDataTableHistory();
      } else {
        this.modalError.openModal(res.message);
      }
    })
  }

}
