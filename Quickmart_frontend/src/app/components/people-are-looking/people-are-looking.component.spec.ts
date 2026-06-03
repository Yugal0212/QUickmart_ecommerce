import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleAreLookingComponent } from './people-are-looking.component';

describe('PeopleAreLookingComponent', () => {
  let component: PeopleAreLookingComponent;
  let fixture: ComponentFixture<PeopleAreLookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeopleAreLookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeopleAreLookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
