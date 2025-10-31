import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service.js';
import { LoginRequestDto } from '../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    const loginRequest: LoginRequestDto = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.snackBar.open(`Welcome back, ${response.username}!`, 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/home']);
        this.isLoading = false;
      },
      error: (error) => {
        let errorMessage = 'An error occurred during login';
        
        if (error.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (error.status === 400) {
          errorMessage = 'Please check your credentials';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server';
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  get usernameError(): string {
    const username = this.loginForm.get('username');
    if (username?.hasError('required')) {
      return 'Username is required';
    }
    if (username?.hasError('minlength')) {
      return 'Username must be at least 3 characters';
    }
    return '';
  }

  get passwordError(): string {
    const password = this.loginForm.get('password');
    if (password?.hasError('required')) {
      return 'Password is required';
    }
    if (password?.hasError('minlength')) {
      return 'Password must be at least 4 characters';
    }
    return '';
  }
}
