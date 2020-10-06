import { Injectable } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Observable } from 'rxjs';

const URLS = {
  SAVE_DATA: 'water003/save',
  GET_DROPDOWN: 'lov/list-data-detail',
  GET_CONFIG: 'electric003/getRateChargeConfig',
  GET_WATER_SIZE: 'water003/get_water_size',
  GET_OTHER_LIST: 'water003/listOrther',
};

@Injectable()
export class Water003detailService {

  constructor(
    private ajax: AjaxService,
    private formBuilder: FormBuilder,
  ) { }

  getParams(paramsKey: string) {
    const primise = new Promise((resolve, reject) => {
      this.ajax.doPost(`${URLS.GET_DROPDOWN}`, { lovKey: paramsKey }).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          console.error(err);
          reject(err);
        });
    });

    return primise.then((data: any) => {
      return data.data;
    });
  }

  getConfig(ampare: string, phase: string) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doPost(`${URLS.GET_CONFIG}`, { electricPhase: phase, electricAmpere: ampare }).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          console.error(err);
          reject(err);
        });
    });

    return promise.then((data: any) => {
      return data.data;
    });
  }

  saveService(dataSave): Observable<any> {
    return new Observable((obs) => {
      this.ajax.doPost(URLS.SAVE_DATA, dataSave).subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === res.status) {
          obs.next(res);
        } else {
          console.log(res.message);
        }
      });
    });
  }

  getOtherList(): Observable<any> {
    return new Observable((obs) => {
      this.ajax.doGet(URLS.GET_OTHER_LIST).subscribe((res: any) => {
        obs.next(res);
      });
    });
  }

  getWaterSize() {
    return new Observable((obs) => {
      this.ajax.doGet(URLS.GET_WATER_SIZE).subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === res.status) {
          obs.next(res);
        } else {
          console.log(res.message);
        }
      });
    });
  }

  getformCustomer() {
    return {
      customerType: [],
      idCard: [],
      customerCode: [],
      customerName: [],
      customerBranch: [],
      contractNo: [],

      addressDocument: [],
      applyType: [''],
      waterType1: [],
      waterType2: [],
      waterType3: [],

      meterSerialNo: [],
      defaultMeterNo: [0],
      meterName: [],
      meterType: [],
      installPosition: [],




      meterSize: [''],
      insuranceRates: [],
      vatInsurance: [],
      totalInsuranceChargeRates: [],
      installRates: [],
      vatInstall: [],
      totalInstallChargeRates: [],
      totalChargeRates: [],

      installPositionService: [],
      rentalAreaCode: [],
      rentalAreaName: [''],
      paymentType: [''],

      requestStartDate: [],
      requestEndDate: [],

      bankName: [],
      bankBranch: [],
      bankExplanation: [],
      bankGuaranteeNo: [],
      bankExpNo: [],

      remark: [],

      sumChargeRate: [],
      totalChargeRate: [],


      requestType: [''],


      adhocType: [''],
      adhocUnit: [],
      personUnit: [],


      sumChargeRatesOther: [],
      sumVatChargeRatesOther: [],
      totalChargeRateOther: [],

      serviceCharge: this.formBuilder.array([])
    };
  }

  getformStaff() {
    return {
      customerType: [],
      idCard: [],
      customerCode: [],
      customerName: [],
      customerBranch: [],
      contractNo: [],

      addressDocument: [],
      applyType: [''],
      waterType1: [],
      waterType2: [],
      waterType3: [],

      meterSerialNo: [],
      defaultMeterNo: [0],
      meterName: [],
      meterType: [],
      installPosition: [],




      meterSize: [''],
      insuranceRates: [],
      vatInsurance: [],
      totalInsuranceChargeRates: [],
      installRates: [],
      vatInstall: [],
      totalInstallChargeRates: [],
      totalChargeRates: [],

      installPositionService: [],
      rentalAreaCode: [],
      rentalAreaName: [''],
      paymentType: [''],

      requestStartDate: [],
      requestEndDate: [],

      bankName: [],
      bankBranch: [],
      bankExplanation: [],
      bankGuaranteeNo: [],
      bankExpNo: [],

      remark: [],

      sumChargeRate: [],
      totalChargeRate: [],

      personUnit: [],
      requestType: [''],


      adhocType: ['0'],
      adhocUnit: [],

      sumChargeRatesOther: [],
      sumVatChargeRatesOther: [],
      totalChargeRateOther: [],

      serviceCharge: this.formBuilder.array([])
    };
  }

  setformCustomer(dataSet) {
    return {
      idCard: dataSet.idCard,
      customerCode: dataSet.customerCode,
      customerName: dataSet.customerName,
      customerBranch: dataSet.customerBranch,
      requestStartDate: dataSet.requestStartDateStr,
      requestEndDate: dataSet.requestEndDateStr,
      contractNo: dataSet.contractNo,
      addressDocument: dataSet.addressDocument,
      requestType: dataSet.requestType,
      waterType1: dataSet.waterType1,
      waterType2: dataSet.waterType2,
      waterType3: dataSet.waterType3,
      applyType: dataSet.applyType,
      meterSize: dataSet.meterSize,
      insuranceRates: dataSet.insuranceRates,
      vatInsurance: dataSet.vatInsurance,
      totalInsuranceChargeRates: dataSet.totalInsuranceChargeRates,
      installRates: dataSet.installRates,
      vatInstall: dataSet.vatInstall,
      totalInstallChargeRates: dataSet.totalInstallChargeRates,
      totalChargeRates: dataSet.totalChargeRates,
      defaultMeterNo: dataSet.defaultMeterNo,
      meterSerialNo: dataSet.meterSerialNo,
      meterType: dataSet.meterType,
      adhocType: dataSet.adhocType,
      adhocUnit: dataSet.adhocUnit,
      personUnit: dataSet.personUnit,
      sumChargeRate: dataSet.sumChargeRate,
      installPosition: dataSet.installPosition,
      installPositionService: dataSet.installPositionService,
      rentalAreaCode: dataSet.rentalAreaCode,
      rentalAreaName: dataSet.rentalAreaName,
      paymentType: dataSet.paymentType,
      remark: dataSet.remark,
      createDate: dataSet.createDate,
      createdBy: dataSet.createdBy,
      meterName: dataSet.meterName,
      customerType: dataSet.customerType,
      approveStatus: dataSet.approveStatus,
      bankName: dataSet.bankName,
      bankBranch: dataSet.bankBranch,
      bankExplanation: dataSet.bankExplanation,
      bankGuaranteeNo: dataSet.bankGuaranteeNo,
      bankExpNo: dataSet.bankExpStr
    };
  }

  setformStaff(dataSet) {
    return {
      idCard: dataSet.idCard,
      customerCode: dataSet.customerCode,
      customerName: dataSet.customerName,
      customerBranch: dataSet.customerBranch,
      requestStartDate: dataSet.requestStartDateStr,
      requestEndDate: dataSet.requestEndDateStr,
      contractNo: dataSet.contractNo,
      addressDocument: dataSet.addressDocument,
      requestType: dataSet.requestType,
      applyType: dataSet.applyType,
      meterSize: dataSet.meterSize,
      insuranceRates: dataSet.insuranceRates,
      vatInsurance: dataSet.vatInsurance,
      totalInsuranceChargeRates: dataSet.totalInsuranceChargeRates,
      installRates: dataSet.installRates,
      vatInstall: dataSet.vatInstall,
      totalInstallChargeRates: dataSet.totalInstallChargeRates,
      totalChargeRates: dataSet.totalChargeRates,
      defaultMeterNo: dataSet.defaultMeterNo,
      meterSerialNo: dataSet.meterSerialNo,
      meterType: dataSet.meterType,
      adhocType: dataSet.adhocType,
      adhocUnit: dataSet.adhocUnit,
      personUnit: dataSet.personUnit,
      sumChargeRate: dataSet.sumChargeRate,
      installPosition: dataSet.installPosition,
      installPositionService: dataSet.installPositionService,
      rentalAreaCode: dataSet.rentalAreaCode,
      rentalAreaName: dataSet.rentalAreaName,
      paymentType: dataSet.paymentType,
      remark: dataSet.remark,
      createDate: dataSet.createDate,
      createdBy: dataSet.createdBy,
      meterName: dataSet.meterName,
      customerType: dataSet.customerType,
      approveStatus: dataSet.approveStatus,
      bankName: dataSet.bankName,
      bankBranch: dataSet.bankBranch,
      bankExplanation: dataSet.bankExplanation,
      bankGuaranteeNo: dataSet.bankGuaranteeNo,
      bankExpNo: dataSet.bankExpStr
    };
  }

}
