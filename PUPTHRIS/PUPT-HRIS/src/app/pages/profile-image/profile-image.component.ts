import { Component, OnInit } from '@angular/core';
import { ProfileImageService } from '../../services/profile-image.service';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProfileImageComponent implements OnInit {
  profileImageUrl: string | null = null;
  userID: number;
  isUpdatingImage: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';

  constructor(
    private profileImageService: ProfileImageService,
    private authService: AuthService
  ) {
    const token = this.authService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userID = decoded.userId;
    } else {
      this.userID = 0;
    }
  }

  ngOnInit(): void {
    this.loadProfileImage();
  }

  loadProfileImage(): void {
    this.profileImageService.getProfileImage(this.userID).subscribe(
      (profileImage) => {
        if (profileImage) {
          this.profileImageUrl = profileImage.ImagePath + '?t=' + new Date().getTime();
        }
      },
      (error) => {
        console.error('Error loading profile image:', error);
      }
    );
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.profileImageService.uploadProfileImage(this.userID, file).subscribe(
        (image) => {
          this.loadProfileImage();
          this.isUpdatingImage = false;
          this.showToastMessage('Profile image updated successfully');
        },
        (error) => {
          console.error('Error uploading profile image:', error);
        }
      );
    }
  }

  startUpdatingImage(): void {
    this.isUpdatingImage = true;
  }

  cancelUpdateImage(): void {
    this.isUpdatingImage = false;
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
