import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreloderTwoComponent } from './preloder-two.component';

describe('PreloderTwoComponent', () => {
  let component: PreloderTwoComponent;
  let fixture: ComponentFixture<PreloderTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreloderTwoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreloderTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
