import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerReviewsComponent } from './seller-reviews.component';

describe('SellerReviewsComponent', () => {
  let component: SellerReviewsComponent;
  let fixture: ComponentFixture<SellerReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
