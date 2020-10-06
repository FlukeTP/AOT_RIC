export class ButtonDatatable {
    public static sap(id: string, disabled: boolean = false): string {
        if (disabled) {
            return `<button class="btn btn-success btn-sm" data-toggle="tooltip" title="ส่งข้อมูลเข้าระบบ SAP" id="${id}" disabled>
            <i class="fa fa-share-square-o" aria-hidden="true"></i>
            </button>`;
        } else {
            return `<button class="btn btn-success btn-sm" data-toggle="tooltip" title="ส่งข้อมูลเข้าระบบ SAP" id="${id}" >
          <i class="fa fa-share-square-o" aria-hidden="true"></i>
          </button>`;
        }
    }

    public static custom(id: string, title: string, color: string = 'info', icon: string = 'fa fa-search', disabled: boolean = false): string {
        if (disabled) {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-${color} btn-sm" id="${id}" disabled>
            <i class="${icon}" aria-hidden="true"></i> 
            </button>`;
        } else {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-${color} btn-sm" id="${id}">
            <i class="${icon}" aria-hidden="true"></i> 
            </button>`;
        }
    }

    public static cancel(id: string, title: string, disabled: boolean = false): string {
        if (disabled) {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-danger btn-sm" id="${id}" disabled>
            <i class="fa fa-times" aria-hidden="true"></i> 
            </button>`;
        } else {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-danger btn-sm" id="${id}">
            <i class="fa fa-times" aria-hidden="true"></i> 
            </button>`;
        }
    }

    public static change(id: string, title: string, disabled: boolean = false): string {
        if (disabled) {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-warning btn-sm" id="${id}" disabled>
            <i class="fa fa-retweet" aria-hidden="true"></i> 
            </button>`;
        } else {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-warning btn-sm" id="${id}">
            <i class="fa fa-retweet" aria-hidden="true"></i> 
            </button>`;
        }
    }

    public static edit(id: string, title: string = 'แก้ไข', disabled: boolean = false): string {
        if (disabled) {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-warning btn-sm" id="${id}" disabled>
            <i class="fa fa-pencil-square-o" aria-hidden="true"></i> 
            </button>`;
        } else {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-warning btn-sm" id="${id}">
            <i class="fa fa-pencil-square-o" aria-hidden="true"></i> 
            </button>`;
        }
    }

    public static detail(id: string, title: string = 'ดูรายละเอียด', disabled: boolean = false): string {
        if (disabled) {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-info btn-sm" id="${id}" disabled>
        <i class="fa fa-search" aria-hidden="true"></i> 
        </button>`;
        } else {
            return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-info btn-sm" id="${id}">
        <i class="fa fa-search" aria-hidden="true"></i> 
        </button>`;
        }
    }

    public static history(id: string, title: string = 'ประวัติ'): string {
        return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-success btn-sm" id="${id}">
        <i class="fa fa-history" aria-hidden="true"></i> 
        </button>`;
    }

    public static remark(id: string, title: string = 'หมายเหตุ'): string {
        return `<button type="button" data-toggle="tooltip" title="${title}" class="btn btn-info btn-sm" id="${id}">
        <i class="fa fa-search" aria-hidden="true"></i> 
        </button>`;
    }

    public static cndn(id: string): string {
        return `<button class="btn btn-primary btn-sm" data-toggle="tooltip" title="ลด/เพิ่มหนี้" id="${id}">
        <i class="fa fa-cart-plus" aria-hidden="true"></i></button>`;
    }
}