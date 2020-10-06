import { Injectable } from '@angular/core';
import { CnDnRequest } from '../common/models/cn-dn.model';

@Injectable()
export class CnDnService {

    dataResponse: CnDnRequest;

    getData(): CnDnRequest {
        return this.dataResponse;
    }

    setData(request: CnDnRequest) {
        this.dataResponse = request;
    }
}
