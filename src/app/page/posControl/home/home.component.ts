import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from 'src/app/_service/user.service.';
import { User } from 'src/app/_model/user';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { CommonService } from 'src/app/_service/ common.service';
import { MessageService } from 'src/app/_service/message.service';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { DateStringPipe } from 'src/app/common/pipes/date-string.pipe';

const URL = { USER_DETAIL : "posc/posUserDetail",
              REPORTING_RULE : "posc/reportingRule",
              UPLOAD_EXCEL : "posc/uploadExcel",
              GET_SALE_PRODUCT : "posc/getSaleProduct"};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  @ViewChild('errorModal') errorModal: ModalErrorComponent;
  @ViewChild('inpFileUpload') inpFileUpload: ElementRef;
  isShown: boolean = true ; 
  isShown1: boolean = true ; 
  public user: User = null;
  public companyCode : string = "";
  public companyDesc : string = "";
  public contract : string = "";
  public frequency : any = null;
  public frequencyOrg : any = null;
  public itemSelect : any = null;
  public showmenu : boolean = true;
  public AUT_BUTTON = { UPLOAD: false, DOWNLOAD:false};
  public searchDate : string = "";
  public reportingRuleList : any = null;
  public reportingRule: string = "";
  public files:File = null;
  public tableList :any = null;
  public dtOptions :DataTables.Settings = null;
  constructor(private userSV: UserService
            , private ajax : AjaxService
            , private common: CommonService) { 
    this.user = new User;
    this.user = this.userSV.currentUserValue;
    let uploadCheck = this.user.authorities.find((val ,i)=>{
      return val === userSV.POS_ROLE[0];
    });
    let downlaodCheck = this.user.authorities.find((val ,i)=>{
      return val === userSV.POS_ROLE[1];
    });
    if(uploadCheck){
      this.AUT_BUTTON.UPLOAD = true;
    }
    if(downlaodCheck){
      this.AUT_BUTTON.DOWNLOAD = true;
    }
    this.dtOptions = this.common.configDataTable();
    // console.log(this.dtOptions);
    // this.dtOptions.pageLength = 30;
  }
  
  ngOnInit() {
    this.ajax.doPost(URL.USER_DETAIL, {username : this.user.username}).subscribe((res: ResponseData<any>) => {
      this.companyCode = res.data.companyCode;
      this.companyDesc = res.data.companyDesc;
      this.contract = res.data.contract;
      this.frequencyOrg = res.data.frequencyReport;
      this.frequency = this.frequencyOrg;
      this.getReportingRule(this.contract);
    });
  }

  clickReq(item){
    this.itemSelect = item;
    if(this.itemSelect.status == 'S'){
      this.AUT_BUTTON.UPLOAD = false;
    }else{
      this.AUT_BUTTON.UPLOAD = true;
    }
    console.log("this.itemSelect",this.itemSelect.posFrequencyReportId);
    this.ajax.doPost(URL.GET_SALE_PRODUCT, {frequencyNo : this.itemSelect.posFrequencyReportId}).subscribe((res: ResponseData<any>) => {
        console.log("res", res);
        this.tableList = res.data.saleProduct;
    });
  }

  getReportingRule(contractNo){
    this.ajax.doPost(URL.REPORTING_RULE, {contractNo : contractNo}).subscribe((res: ResponseData<any>) => {
      this.reportingRuleList = res.data;
    });
  }
  onChangeSearch(){
    if(this.searchDate){
      this.frequency = this.frequencyOrg.filter((val ,i)=>{
        var startDate = new DateStringPipe().transform(val.startDate, false);
        var endDate = new DateStringPipe().transform(val.endDate, false);
        return startDate.indexOf(this.searchDate) !== -1  || endDate.indexOf(this.searchDate) !== -1;
      });
    }else{
      this.frequency = this.frequencyOrg;
    }
  }
  onChangeReportingRule(){
    if(this.reportingRule){
      this.frequency = this.frequencyOrg.filter((val ,i)=>{
        return val.reportingRuleNo.indexOf(this.reportingRule) !== -1;
      });
    }else{
      this.frequency = this.frequencyOrg;
    }
  }
  onFileChange(files: FileList){
    this.files = files.item(0);
  }
  uploadExcel(){
    console.log("this.itemSelect", this.itemSelect);
    if(this.files){
      const formBody = new FormData();
      formBody.append('frequencyNo', this.itemSelect.posFrequencyReportId);
      formBody.append('fileUpload', this.files);
      this.common.loading();
      this.ajax.upload(URL.UPLOAD_EXCEL, formBody, res => {
        if (MessageService.MSG.SUCCESS === res.json().status) {
          this.successModal.openModal();
          this.tableList = res.json().data.saleProduct;
        } else {
          this.errorModal.openModal('ไม่สามารถอัพโหลดไฟล์ได้');
        }
        this.resetInpFileUpload();
        this.common.unLoading();
      });
    }
  }
  downloadExcel(){

  }
  menuShow() {
      this.showmenu = !this.showmenu;
  }
  resetInpFileUpload() {
    this.inpFileUpload.nativeElement.value = "";
  }
}
