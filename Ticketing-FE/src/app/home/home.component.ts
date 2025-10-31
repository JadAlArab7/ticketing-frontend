import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service.js';
import { User } from '../models/auth.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  onLogout(): void {
    this.authService.logout();
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  navigateToTicketList(): void {
    this.router.navigate(['/tickets/list']);
  }

  navigateToTicketForm(): void {
    this.router.navigate(['/tickets/form']);
  }
}
