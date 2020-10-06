import { Injectable } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup } from '@angular/forms';

const URL = {
    SEARCH: 'communicate002/search',
    SEND_TO_SAP: 'communicate002/send-to-sap',
};
@Injectable()
export class Communi002Service {
    constructor(private ajax: AjaxService, ) { }

    search(formSave: FormGroup) {
        return this.ajax.doPost(URL.SEARCH, formSave.value);
    }

    sendToSAP(id: number) {
        return this.ajax.doPost(URL.SEND_TO_SAP, id);
    }
}