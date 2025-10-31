import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequestDto, LoginResponseDto, User } from '../models/auth.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  /**
   * Login with credentials
   * @param credentials - LoginRequestDto with username and password
   * @returns Observable with login result
   */
  login(credentials: LoginRequestDto): Observable<LoginResponseDto> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponseDto>(`${this.API_BASE_URL}/User/login`, credentials, { headers })
      .pipe(
        tap((response: LoginResponseDto) => {
          // Store token and user data in localStorage
          localStorage.setItem(this.TOKEN_KEY, response.token);
          
          const user: User = {
            id: response.id,
            username: response.username,
            departmentName: response.departmentName,
            departmentType: response.departmentType
          };
          
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated
   * @returns boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return false;
    }

    try {
      // Parse mock token and check expiration
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch (e) {
      return false;
    }
  }

  /**
   * Get current auth token
   * @returns token string or null
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get current user from localStorage
   * @returns User object or null
   */
  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Get user's department information
   * @returns object with department name and type
   */
  getUserDepartment(): { name: string; type: string } | null {
    const user = this.getCurrentUser();
    return user ? { name: user.departmentName, type: user.departmentType } : null;
  }
}
