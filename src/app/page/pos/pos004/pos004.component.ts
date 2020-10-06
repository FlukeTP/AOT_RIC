import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { Router } from '@angular/router';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { DecimalFormatPipe } from 'src/app/common/pipes';
declare var $: any;
const URL = {
  LIST: "pos004/list"
}
@Component({
  selector: 'app-pos004',
  templateUrl: './pos004.component.html',
  styleUrls: ['./pos004.component.css']
})
export class Pos004Component implements OnInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  dataList: any[] = [];
  dataTable: any;
  breadcrumb: any = [
    {
      label: "หมวดข้อมูลยอดรายได้",
      link: "/pos",
    },
    {
      label: "จัดการบัญชีผู้ประกอบการ",
      link: "#",
    },

  ];
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: Router
  ) {
    this.getList();
  }

 
  ngOnInit() {
  }
  //=========================== ACTION =============================
  onManageUser(id: any) {
    this.router.navigate(["/pos/pos004detail"], {
      queryParams: {
        id: id
      }
    });
  }

  //================ call back-end ========================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.LIST, {}).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        if (res.data.length > 0) {
          this.dataList = res.data;
        } else {
          this.dataList = [];
        }
      } else {
        this.dataList = [];
        this.modalError.openModal(res.message);
      }
      this.initDataTable();
      this.commonService.unLoading();
    });

  }

  //=============== table =======================
  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: this.dataList,
      columns: [
        {
          data: 'contractNo', className: 'text-center'
        }, {
          data: 'customerName', className: 'text-left'
        },{
          data: 'numUser', className: 'text-left'
        }, {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
      ],
    });

    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onManageUser(data.posCustomerId);
    });
  }
}
