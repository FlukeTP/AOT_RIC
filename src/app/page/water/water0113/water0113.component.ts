import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router } from '@angular/router';
import { DateStringPipe } from 'src/app/common/pipes/date-string.pipe';
import { DecimalFormatPipe } from 'src/app/common/pipes/decimal-format.pipe';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
declare var $: any;

const URL = {
  EXPORT: "download-template-info",
  LIST: "water0113/list"
}

@Component({
  selector: 'app-water0113',
  templateUrl: './water0113.component.html',
  styleUrls: ['./water0113.component.css']
})
export class Water0113Component implements OnInit {
  @ViewChild('modalRemark') modalRemark: ModalCustomComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระรายครั้ง",
      link: "/water/water011",
    },
    {
      label: "เพิ่มรายการปรับปรุงอัตราค่าภาระบริการน้ำประปาอื่นๆ",
      link: "#",
    },

  ];

  dataList: any[] = [];
  dataTable: any;
  remarkStr: string;

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.getList();
  }

  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.LIST, {}).subscribe((res: ResponseData<any>) => {
      this.dataList = res.data;
      console.log("this.dataList : ", this.dataList);
      this.initDataTable();
      this.commonService.unLoading();
    });
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    this.ajax.download(`${URL.EXPORT}/WATER0113/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: this.dataList,
      columns: [
        {
          data: 'airport', className: 'text-left'
        }, {
          data: 'modifiedDate',
          render(data) {
            return new DateStringPipe().transform(data);
          }, className: 'text-center'
        },
        {
          data: 'waterType', className: 'text-center'
        },
        {
          data: 'chargeRates',
          render(data) {
            return new DecimalFormatPipe().transform(data);
          }, className: 'text-right'
        },
        {
          data: 'createdDate',
          render(data) {
            return new DateStringPipe().transform(data);
          }, className: 'text-center'
        },
        {
          data: 'createdBy'
        }, {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `
            <button type="button" class="btn btn-info btn-social-icon" id="remark"><i class="fa fa-search" aria-hidden="true"></i></button>
            <button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
            <button type="button" class="btn btn-success btn-social-icon" id="history"><i class="fa fa-history" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
      ],
    });
    this.dataTable.on('click', 'tbody tr button#remark', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onClickRemark(data.remark);
    });
    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.router.navigate(['water/water0113detail'], {
        queryParams: {
          id: data.waterOtherId
        }
      });
    });
    this.dataTable.on('click', 'tbody tr button#history', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      // this.router.navigate(['components/constant/detail'], {
      //   queryParams: {
      //     id: data.constantId
      //   }
      // });
    });
  }

  onClickRemark(tetx: string) {
    this.remarkStr = tetx;
    this.modalRemark.openModal();
  }

}
