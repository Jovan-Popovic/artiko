import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { StrapiServiceService } from '../services/strapi-service.service';

@Component({
  selector: 'app-createpost',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './createpost.component.html',
  styleUrl: './createpost.component.css',
})
export class CreatepostComponent {
  description = '';
  price: number | null = null; // Optional field
  selectedImage: File | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private strapiService: StrapiServiceService,
    private authService: AuthService,
    private router: Router
  ) {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      console.log('Selected File:', file);
    }
  }

  createPost(): void {
    const userId = this.authService.getCurrentUserId(); // Fetch the current user ID
    if (!userId) {
      this.errorMessage = 'You must be logged in to create a post.';
      return;
    }

    this.strapiService
      .createPost(
        this.description,
        userId,
        this.selectedImage || undefined,
        this.price ?? undefined
      )
      .subscribe({
        next: (response) => {
          console.log('Post created successfully!', response);
          this.successMessage = 'Post created successfully!';
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Create post error:', error);
          this.errorMessage = 'Failed to create post. Please try again.';
        },
      });
  }
}
