import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router } from '@angular/router';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';

declare var $: any;

const URLS = {
  EXPORT: "download-template-info",
};

@Component({
  selector: 'app-water002',
  templateUrl: './water002.component.html',
  styleUrls: ['./water002.component.css']
})
export class Water002Component implements OnInit {
  @ViewChild('modalRemark') modalRemark: ModalCustomComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  dataList: any[] = [];
  dataListFilter: any[] = [];
  showMainContent: Boolean = true;
  formData: FormGroup;
  dataTable: any;
  datadetail: any[];
  dataMetId: any;
  remarkStr: string;
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.formData = this.formBuilder.group({
      serialNo: ["", Validators.required],
      status: ["", Validators.required],
      meterNp: ["", Validators.required]
    })
  }
  breadcrumb: any = [
    {
      label: 'หมวดน้ำประปา',
      link: '/',
    },
    {
      label: 'จัดการมิเตอร์น้ำประปา',
      link: '#',
    },

  ];

  ShowHideButton() {
    this.showMainContent = this.showMainContent ? false : true;
  }
  ngOnInit() {
    this.getList();
  }


  getList() {
    this.commonService.loading();
    const URL = "water002/list";
    this.ajax.doPost(URL, this.formData.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      this.dataList = res.data
      this.initDataTable(this.dataList);
      console.log("this.dataList : ", this.dataList);
      this.commonService.unLoading();
    });
  }
  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    Object.keys(this.formData.value).forEach(key => {
      if (this.formData.get(key).value !== "") {
        arrOfId.push(this.formData.get(key).value);
      } else {
        arrOfId.push("-");
      }

    });
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URLS.EXPORT}/WATER002/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  initDataTable = (data: any[]) => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: data,
      columns: [
        {
          data: 'airport', className: 'text-left'
        }, {
          data: 'serialNo', className: 'text-center'
        }, {
          data: 'meterName', className: 'text-center'
        }, {
          data: 'meterType', className: 'text-center'
        }, {
          data: 'meterLocation', className: 'text-left'
        }, {
          data: 'meterStatus', className: 'text-center',
          render: function (data, type, row, mata) {
            let stat
            if (data == 'open') {
              stat = "<a style='color: green'>ใช้งาน</a>"
            } else if (data == 'close') {
              stat = "<a style='color: red'>ไม่ใช้งาน</a>"
            }
            return stat
          }
        }, {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `
            <button type="button" class="btn btn-info btn-social-icon" id="detail"><i class="fa fa-search" aria-hidden="true"></i></button>
            <button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
            `;
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
    this.dataTable.on('click', 'tbody tr button#detail', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.showModal(data.meterId)
    });
    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.router.navigate(['water/water002detail'], {
        queryParams: {
          id: data.meterId
        }
      });
    });
  }

  showModal(id: any) {
    this.dataListFilter = [];
    this.datadetail = [];
    this.dataListFilter = this.dataList.filter((data) => {
      return data.meterId == id;
    });
    this.datadetail = this.dataListFilter[0]
    console.log("datafilter", this.datadetail);
    $('#myModal').modal('show');
  }

  hideModal() {
    $('#myModal').modal('hide');
  }

  onClickRemark(tetx: string) {
    this.remarkStr = tetx;
    this.modalRemark.openModal();
  }




}
