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
import { TicketListItemDto } from '../models/ticket.models';

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
  tickets: TicketListItemDto[] = [];
  displayedColumns: string[] = ['subject', 'type', 'department', 'assignee', 'status', 'deadline', 'actions'];
  private readonly statusClassMap: Record<string, string> = {
    'new': 'status-new',
    'in progress': 'status-in-progress',
    'resolved': 'status-resolved',
    'closed': 'status-closed',
    'rejected': 'status-rejected'
  };

  private readonly typeClassMap: Record<string, string> = {
    'rfi': 'type-rfi',
    'report': 'type-report'
  };

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

  onRowClick(ticket: TicketListItemDto): void {
    // Navigate to view mode when clicking on a row
    this.router.navigate(['/tickets/view', ticket.id]);
  }

  onViewTicket(ticket: TicketListItemDto, event?: Event): void {
    // Prevent event bubbling when clicking the action button
    event?.stopPropagation();
    this.router.navigate(['/tickets/view', ticket.id]);
  }

  onEditTicket(ticket: TicketListItemDto, event?: Event): void {
    // Prevent event bubbling when clicking the action button
    event?.stopPropagation();
    this.router.navigate(['/tickets/form'], { queryParams: { id: ticket.id } });
  }

  onDeleteTicket(ticket: TicketListItemDto, event?: Event): void {
    // Prevent event bubbling when clicking the action button
    event?.stopPropagation();
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

  getAssignee(ticket: TicketListItemDto): string {
    // Always take assignedToDepartments[0] for assignee
    return ticket.assignedToDepartments && ticket.assignedToDepartments.length > 0 
      ? ticket.assignedToDepartments[0] 
      : 'Not assigned';
  }

  getStatusClass(status: string | null | undefined): string {
    if (!status) {
      return 'status-default';
    }
    const normalized = status.trim().toLowerCase();
    return this.statusClassMap[normalized] ?? 'status-default';
  }

  getTypeClass(type: string | null | undefined): string {
    if (!type) {
      return 'type-default';
    }
    const normalized = type.trim().toLowerCase();
    return this.typeClassMap[normalized] ?? 'type-default';
  }

  formatDate(dateString: string): Date {
    return new Date(dateString);
  }
}