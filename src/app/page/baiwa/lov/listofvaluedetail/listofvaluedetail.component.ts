import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { Utils } from 'src/app/common/helper/utils';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';

const URL = {
  SAVE: "lov/save",
  EDIT: "lov/listdata",
  EDIT_DATA: "lov/edit"
}

@Component({
  selector: 'app-listofvaluedetail',
  templateUrl: './listofvaluedetail.component.html',
  styleUrls: ['./listofvaluedetail.component.css']
})
export class ListofvaluedetailComponent implements OnInit {

  breadcrumb: any = [
    {
      label: "ตั้งค่าข้อมูล",
      link: "/home",
    },
    {
      label: "รายการข้อมูล LOV",
      link: "/components/lov",
    },
    {
      label: "เพิ่มข้อมูลและแก้ไขข้อมูล",
      link: "#",
    },
  ];
  buttomedit: boolean = true;
  dataLovSearch: any;
  formAddLov: FormGroup;
  id: string = '';
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  // @ViewChild('editModal') modalEdit: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.formAddLov = this.formBuilder.group({
      lovHeaderId: ["", Validators.required],
      lovKey: ["", Validators.required],
      descripton: ["", Validators.required]
    })
  }
  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editFormAddLovSearch(this.id);
      this.buttomedit = false;
    }
  }

  saveFormAddLov() {
    console.log("saveFormAddLov : ", this.formAddLov.value);
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formAddLov.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.successModal.openModal();
        this.router.navigate(['components/lov']);
      } else if (MessageService.MSG.DUPLICATE_DATA == res.status) {
        console.log(res.message);
        this.modalError.openModal(res.message);
      } else {
        console.log(res.message);
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }


  editFormAddLovSearch(id: any) {
    let lovHeaderId = id
    console.log("editFormAddLov : ", lovHeaderId);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, { lovHeaderId }).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.dataLovSearch = res.data;
        this.setDataTo();
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  setDataTo() {
    this.formAddLov.patchValue({
      lovHeaderId: this.dataLovSearch.lovHeaderId,
      lovKey: this.dataLovSearch.lovKey,
      descripton: this.dataLovSearch.descripton
    })
  }

  editFormAddLov() {
    console.log("editFormAddElectricity : ", this.formAddLov.value);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_DATA, this.formAddLov.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.router.navigate(['components/lov']);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

}


