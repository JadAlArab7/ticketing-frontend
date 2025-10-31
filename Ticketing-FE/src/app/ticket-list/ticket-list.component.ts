import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TicketService } from '../services/ticket.service';
import { User } from '../models/auth.models';
import { TicketResponseDto } from '../models/ticket.models';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.sass'
})
export class TicketListComponent implements OnInit {
  currentUser: User | null = null;
  tickets: TicketResponseDto[] = [];
  displayedColumns: string[] = ['id', 'subject', 'type', 'assignee', 'status', 'deadline', 'actions'];

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Get tickets from resolver
    this.route.data.subscribe(data => {
      this.tickets = data['tickets'] || [];
    });
  }

  onCreateTicket(): void {
    this.router.navigate(['/tickets/form']);
  }

  onViewTicket(ticket: TicketResponseDto): void {
    this.router.navigate(['/tickets/form'], { queryParams: { id: ticket.id } });
  }

  onEditTicket(ticket: TicketResponseDto): void {
    this.router.navigate(['/tickets/form'], { queryParams: { id: ticket.id } });
  }

  onDeleteTicket(ticket: TicketResponseDto): void {
    if (confirm(`Are you sure you want to delete ticket "${ticket.subject}"?`)) {
      // Use real API call now
      this.ticketService.deleteTicket(ticket.id).subscribe({
        next: () => {
          this.tickets = this.tickets.filter(t => t.id !== ticket.id);
        },
        error: (error) => {
          console.error('Error deleting ticket:', error);
          let errorMessage = 'Error deleting ticket. Please try again.';
          
          if (error.status === 401) {
            errorMessage = 'Authentication required. Please login again.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to delete this ticket.';
          }
          
          // You might want to show this error to the user
          console.error(errorMessage);
        }
      });

      // TODO: Remove mock behavior below when API is confirmed working
      /*
      // Simulate delete for now
      this.tickets = this.tickets.filter(t => t.id !== ticket.id);
      console.log('Ticket deleted (mock):', ticket.id);
      */
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'open': return 'warn';
      case 'in progress': return 'accent';
      case 'closed': return 'primary';
      default: return '';
    }
  }

  formatDate(dateString: string): Date {
    return new Date(dateString);
  }
}