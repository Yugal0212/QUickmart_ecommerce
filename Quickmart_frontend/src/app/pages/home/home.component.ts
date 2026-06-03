import { Component} from '@angular/core';
import { CardsAndAdvantagesComponent } from "../../components/cards-and-advantages/cards-and-advantages.component";
import { PeopleAreLookingComponent } from "../../components/people-are-looking/people-are-looking.component";
import { PreloaderComponent } from "../../components/preloader/preloader.component";
import { ProductCategoryComponent } from "../../components/product-category/product-category.component";
import { BestSellingComponent } from "../../components/best-selling/best-selling.component";
import { FeaturedProductComponent } from "../../components/featured-product/featured-product.component";
import { DiscountComponent } from "../../components/discount/discount.component";
import { RecentBlogComponent } from "../../components/recent-blog/recent-blog.component";
import { AppDownloadComponent } from "../../components/app-download/app-download.component";
import { JustArrivedComponent } from "../../components/just-arrived/just-arrived.component";
import { HeroComponent } from "../../components/hero/hero.component";

@Component({
  selector: 'app-home',
  imports: [ CardsAndAdvantagesComponent, PeopleAreLookingComponent ,ProductCategoryComponent, BestSellingComponent, FeaturedProductComponent,  DiscountComponent, RecentBlogComponent, AppDownloadComponent, JustArrivedComponent, HeroComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  
}
