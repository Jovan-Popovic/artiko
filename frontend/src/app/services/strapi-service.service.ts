import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StrapiServiceService {
  private apiUrl = 'http://localhost:1337/api/posts'; // URL do tvog Strapi API-a

  constructor(private http: HttpClient) {}

  // Metoda za dobijanje svih postova, uključujući slike i korisnike
  getAllPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}?populate=*`); // 'populate=*' učitava slike i korisnike
  }

  searchUsers(query: string) {
    const url = `http://localhost:1337/api/users?filters[username][$contains]=${query}`;
    return this.http.get<any[]>(url);
  }
  getUserById(id: string) {
    const url = `http://localhost:1337/api/users/${id}`;
    return this.http.get<any>(url);
  }
  createPost(
    description: string,
    userId: string,
    image?: File,
    price?: number
  ): Observable<any> {
    const token = localStorage.getItem('jwt'); // Get the JWT token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // Check if an image is provided
    if (image) {
      // Step 1: Upload the image
      const formData = new FormData();
      formData.append('files', image); // Add the image file to the FormData object

      return new Observable((observer) => {
        // Upload the image to the /upload endpoint
        this.http
          .post('http://localhost:1337/api/upload', formData, {
            headers,
          })
          .subscribe({
            next: (uploadResponse: any) => {
              // Step 2: Create the post with the file's ID in the "image" field
              const uploadedFile = uploadResponse[0];
              const data = {
                data: {
                  description,
                  user: userId,
                  image: [uploadedFile.id],
                  // image: uploadedFile.documentId,
                  ...(price !== undefined && { price }),
                },
              };

              this.http
                .post('http://localhost:1337/api/posts', data, { headers })
                .subscribe({
                  next: (response) => {
                    observer.next(response); // Emit the post creation response
                    observer.complete();
                  },
                  error: (error) => observer.error(error), // Handle errors during post creation
                });
            },
            error: (error) => observer.error(error), // Handle errors during file upload
          });
      });
    } else {
      // If no image is provided, create the post without the "image" field
      const data = {
        data: {
          description,
          user: userId,
          ...(price !== undefined && { price }),
        },
      };

      return this.http.post('http://localhost:1337/api/posts', data, {
        headers,
      });
    }
  }
}
