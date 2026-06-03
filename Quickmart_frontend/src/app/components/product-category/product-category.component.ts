import { Component, OnInit } from '@angular/core';
import { CategoriesService, Category } from '../../Services/Categories/categories.service';
import { NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import 'swiper/swiper-bundle.css';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-product-category',
  imports: [ReactiveFormsModule, NgFor, RouterLink,NgIf],
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.css']
})
export class ProductCategoryComponent implements OnInit {
  categories: Category[] = [];
  private swiper: Swiper | null = null;

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.categoriesService.getAllCategories().subscribe({
      next: (data) => {
        console.log('Categories Data:', data);
        this.categories = data;

        // Initialize Swiper after data is loaded
        this.initSwiper();
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  private initSwiper() {
    // Destroy existing Swiper instance if it exists
    if (this.swiper) {
      this.swiper.destroy();
    }

    // Initialize Swiper
    setTimeout(() => {
      this.swiper = new Swiper('.category-carousel', {
        modules: [Navigation],
        navigation: {
          nextEl: '.swiper-next',
          prevEl: '.swiper-prev',
        },
        slidesPerView: 4, // Adjust as needed
        spaceBetween: 20, // Adjust as needed
        breakpoints: {
          // Responsive breakpoints
          320: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
        },
      });
    }, 0); // Small delay to ensure DOM is fully rendered
  }
}