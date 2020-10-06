import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemConstantComponent } from './system-constant.component';

describe('SystemConstantComponent', () => {
  let component: SystemConstantComponent;
  let fixture: ComponentFixture<SystemConstantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemConstantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemConstantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
