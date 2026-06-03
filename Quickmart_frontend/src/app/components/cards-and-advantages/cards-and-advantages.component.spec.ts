import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsAndAdvantagesComponent } from './cards-and-advantages.component';

describe('CardsAndAdvantagesComponent', () => {
  let component: CardsAndAdvantagesComponent;
  let fixture: ComponentFixture<CardsAndAdvantagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsAndAdvantagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsAndAdvantagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
