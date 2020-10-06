import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})
export class DatatableComponent implements OnInit {

  constructor() { }
  dtOptions: DataTables.Settings = {};
  datas: any = [
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    }, {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },

    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    }, {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },
    {
      data1: "1",
      data2: "top",
      data3: "tee",
      data4: "1",
      data5: "2",
      data6: "24"
    },

  ]
  tableHtml = `
  <table datatable [dtOptions]="dtOptions"
    class="table table-bordered table-striped table-sm" 
    style="width:100%">
   </table>`;
  tableTs = `
    dtOptions: DataTables.Settings = {};

    Add options

    this.dtOptions = {
      pagingType: 'full_numbers',
      ordering: false,
      data: this.datas,
      columns: [{
        data: 'data1'
      }, {
        data: 'data2'
      }, {
        data: 'data3'
      }, {
        data: 'data4'
      }, {
        data: 'data5'
      }, {
        data: 'data6'
      }]
    };
  `;
  tableTsAjax = `
  
  `;
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      ordering: false,
      scrollX: true,
      data: this.datas,
      columns: [{
        data: 'data1'
      }, {
        data: 'data2'
      }, {
        data: 'data3'
      }, {
        data: 'data4'
      }, {
        data: 'data5'
      }, {
        data: 'data6'
      }]
    };
  }

}
