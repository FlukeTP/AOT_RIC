import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { Router } from '@angular/router';
import { CheckNumber, Utils } from 'src/app/common/helper';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';

const URL = {
  GET_ALL: "communi0063/get_all",
}
@Component({
  selector: 'app-communi0063',
  templateUrl: './communi0063.component.html',
  styleUrls: ['./communi0063.component.css']
})
export class Communi0063Component implements OnInit {

  @ViewChild('modalRemark') modalRemark: ModalCustomComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระการใช้บริการสื่อสาร",
      link: "#",
    },

  ];

  remarkStr: string = '';
  dataTable: any;
  dataList: any[] = [];
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: Router
  ) { }

  // ===================== Initial setting ============
  ngOnInit() {
  }
  async ngAfterViewInit() {
    await this.getList();
    // this.initDataTable();
    // call Function event Click button in dataTable
    // this.clickBtn();
  }
  // =============== Action ======================
  onClickRemark(text: string) {
    this.remarkStr = text;
    this.modalRemark.openModal(ModalCustomComponent.MODAL_SIZE.LARGE);
  }
  // =============== back-end =======================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, {}).subscribe(async (res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        await this.initDataTable();
        this.clickBtn();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }
  // ================= data table ====================
  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderNumber = function (number: number, length: number = 0) {
      return Utils.isNull(number) ? "-" : $.fn.dataTable.render.number(",", ".", length, "").display(number);
    };

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      data: this.dataList,
      columns: [
        {
          data: 'effectiveDate', className: 'text-center', render: renderString
        },
        // {
        //   data: 'serviceType', className: 'text-left'
        // },
        {
          data: 'chargeRate', className: 'text-right',
          render(data, type, row, meta) {
            return renderNumber(data, 2);
          }
        },
        {
          data: 'insuranceFee', className: 'text-right',
          render(data, type, row, meta) {
            return renderNumber(data, 2);
          }
        },
        {
          data: 'updatedDate', className: 'text-center', render: renderString
        },
        {
          data: 'updatedBy', className: 'text-left', render: renderString
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            return `${ButtonDatatable.detail('remark', 'หมายเหตุ')} ${ButtonDatatable.edit('edit')} ${ButtonDatatable.history('history')}`;
            // return `<button type="button"  data-toggle="tooltip" title="หมายเหตุ" class="btn btn-info btn-social-icon" id="remark"><i class="fa fa-search" aria-hidden="true"></i></button>
            // <button class="btn btn-warning btn-sm"  data-toggle="tooltip" title="แก้ไข" id="edit" type="button"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>
            // <button type="button"  data-toggle="tooltip" title="ประวัติ" class="btn btn-success btn-social-icon" id="history"><i class="fa fa-history" aria-hidden="true"></i></button>
            // `;
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
      this.router.navigate(['/communi/communi0063detail'], {
        queryParams: {
          commuFlightInfoConfigId: data.commuFlightInfoConfigId
        }
      })
    });
  }
}
