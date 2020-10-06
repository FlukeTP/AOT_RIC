import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Pos002detailComponent } from './pos002detail.component';

describe('Pos002detailComponent', () => {
  let component: Pos002detailComponent;
  let fixture: ComponentFixture<Pos002detailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Pos002detailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Pos002detailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
