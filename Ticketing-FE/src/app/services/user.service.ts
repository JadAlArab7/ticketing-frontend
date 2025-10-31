import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService } from './auth.service.js';
import { User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private authService: AuthService) {}

  /**
   * Get current user information
   * @returns Observable of User object
   */
  getCurrentUser(): Observable<User | null> {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      return of(null);
    }

    // Return user data from auth service
    return of(user).pipe(delay(300));
  }

  /**
   * Get user by ID (mock implementation)
   * @param userId - the user ID
   * @returns Observable of User object
   */
  getUserById(userId: string): Observable<User | null> {
    // Mock user data - replace with real API call
    const mockUser: User = {
      id: userId,
      username: 'mockuser',
      departmentName: 'IT Department',
      departmentType: 'Technology'
    };

    return of(mockUser).pipe(delay(300));
  }

  /**
   * Update user profile (mock implementation)
   * @param userData - partial user data to update
   * @returns Observable of updated User
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('No current user found');
    }

    const updatedUser: User = {
      ...currentUser,
      ...userData
    };

    // Update localStorage
    localStorage.setItem('current_user', JSON.stringify(updatedUser));

    return of(updatedUser).pipe(delay(300));
  }
}
