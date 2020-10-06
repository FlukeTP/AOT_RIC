import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemConstantMangementComponent } from './system-constant-mangement.component';

describe('SystemConstantMangementComponent', () => {
  let component: SystemConstantMangementComponent;
  let fixture: ComponentFixture<SystemConstantMangementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemConstantMangementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemConstantMangementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
