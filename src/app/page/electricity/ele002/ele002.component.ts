import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router } from '@angular/router';
declare var $: any;

const URL = {
  EXPORT: "download-template-info",
}
@Component({
  selector: 'app-ele002',
  templateUrl: './ele002.component.html',
  styleUrls: ['./ele002.component.css']
})
export class Ele002Component implements OnInit {
  dataList: any[] = [];
  showMainContent: Boolean = true;
  formSearch: FormGroup;
  formEdit: FormGroup;
  datadetail: any;
  datadetailedit: any;
  dataListFilter: any[] = [];
  dataListFilterEdit: any[] = [];
  dataTable: any;
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.formSearch = this.formBuilder.group({
      serialNo: ["", Validators.required],
      status: ["", Validators.required],
      meterNp: ["", Validators.required]
    })
    this.formEdit = this.formBuilder.group({
      meterId: ["", Validators.required],
      meterType: ["", Validators.required],
      meterName: ["", Validators.required],
      meterLocation: ["", Validators.required],
      meterStatus: ["", Validators.required],
      remark: ["", Validators.required],
      serialNo: ["", Validators.required],
      multipleValue: ["", Validators.required],
      functionalLocation: ["", Validators.required],
      serviceNumber: ["", Validators.required],
      airport: ["", Validators.required]
    })
  }


  breadcrumb: any = [
    {
      label: "หมวดไฟฟ้า",
      link: "/home/elec",
    },
    {
      label: "จัดการมิเตอร์ไฟฟ้า",
      link: "#",
    },

  ];

  ShowHideButton() {
    this.showMainContent = this.showMainContent ? false : true;
  }

  ngOnInit() {
    this.getList();
  }

  showModal(id: any) {
    this.dataListFilter = [];
    this.datadetail = [];
    this.dataListFilter = this.dataList.filter((data) => {
      return data.meterId == id;
    });
    this.datadetail = this.dataListFilter[0]
    // if (this.datadetail.meterStatus == "open") {
    //   this.datadetail.meterStatus = "เปิดใช้งาน"
    // } else if (this.datadetail.meterStatus == "close") {
    //   this.datadetail.meterStatus = "ปิดใช้งาน"
    // }
    console.log("datafilter", this.datadetail);
    $('#myModal').modal('show');
  }

  hideModal() {
    $('#myModal').modal('hide');
  }

  Edit(id: any) {
    this.router.navigate(['electricity/ele002detail'], {
      queryParams: {
        id: id
      }
    });
  }

  hideModalEdit() {
    $('#myModalEdit').modal('hide');
  }

  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    Object.keys(this.formSearch.value).forEach(key => {
      if (this.formSearch.get(key).value !== "") {
        arrOfId.push(this.formSearch.get(key).value);
      } else {
        arrOfId.push("-");
      }

    });
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/ELECTRIC002/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }


  getList() {
    this.commonService.loading();
    const URL = "electric002/list";
    this.ajax.doPost(URL, this.formSearch.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data[0]);
      this.dataList = res.data
      this.initDataTable(this.dataList);
      console.log("this.dataList : ", this.dataList);
      this.commonService.unLoading();
    });
  }

  initDataTable = (data: any[]) => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: data,
      scrollY: false,
      scrollCollapse: false,
      columns: [
        {
          data: 'serialNo', className: 'text-center'
        }, {
          data: 'meterName', className: 'text-left'
        }, {
          data: 'meterType', className: 'text-center'
        }, {
          data: 'meterLocation', className: 'text-center'
        }, {
          data: 'functionalLocation', className: 'text-left'
        }, {
          data: 'serviceNumber', className: 'text-center'
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
            _btn += `<button type="button" class="btn btn-info btn-social-icon" id="detail"><i class="fa fa-search" aria-hidden="true"></i></button>`;
            _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
      ],
    });
    this.dataTable.on('click', 'tbody tr button#detail', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.showModal(data.meterId)
    });
    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.Edit(data.meterId)
    });
  }
}

// <td align="center">{{list.serialNo}}</td>
// <td>{{list.meterName}}</td>
// <td align="center">{{list.meterType}}</td>
// <td align="center">{{list.meterLocation}}</td>
// <td>{{list.functionalLocation}}</td>
// <td align="center">{{list.serialNo}}</td>
// <td align="center" *ngIf="list.meterStatus == 'open' " style="color: green">ใช้งาน</td>
// <td align="center" *ngIf="list.meterStatus == 'close' " style="color: red">ไม่ใช้งาน</td>
// <td class="text-center">
//   <button-icon color="info" ><i class="fa fa-search" aria-hidden="true"
//       (click)="showModal(list.meterId)"></i>
//   </button-icon>
// </td>
// <td class="text-center">
//   <button-icon (click)="Edit(list.meterId)" color="warning"><i class="fa fa-pencil-square-o"
//       aria-hidden="true"></i></button-icon>
// </td>
// </tr>