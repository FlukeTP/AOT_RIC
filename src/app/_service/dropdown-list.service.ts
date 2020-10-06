import { Injectable } from '@angular/core';
import { AjaxService } from './ajax.service';

@Injectable()
export class DropdownOrListService {
    constructor(private ajax: AjaxService) { }

    getCustomerList(data: any) {
        return this.ajax.doPost('common/getSAPCustumer', data);
    }

    getContractNo(partner: string, branchCode: string) {
        return this.ajax.doGet(`common/getSAPContractNo/${partner}/${branchCode}`);
    }

    getRentalArea(contractNo: string) {
        return this.ajax.doGet(`common/getUtilityArea/${contractNo}`);
    };

    getParamsLov(paramsKey: string) {
        return this.ajax.doPost(`lov/list-data-detail`, { lovKey: paramsKey });
    }
}