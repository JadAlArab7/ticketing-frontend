import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { TicketService } from '../services/ticket.service';
import { TicketStatusService } from '../services/ticket-status.service';
import { User } from '../models/auth.models';
import { TicketResponseDto, TicketStatusHelpers, TicketStatus, UpdateTicketDto } from '../models/ticket.models';

@Component({
  selector: 'app-ticket-view',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  templateUrl: './ticket-view.component.html',
  styleUrl: './ticket-view.component.sass'
})
export class TicketViewComponent implements OnInit {
  currentUser: User | null = null;
  ticket: TicketResponseDto | null = null;
  ticketId: string = '';

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private ticketStatusService: TicketStatusService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Get ticket from resolved data
    this.route.data.subscribe(data => {
      this.ticket = data['ticket'];
      if (this.ticket) {
        this.ticketId = this.ticket.id;
      }
    });
  }

  onEditTicket(): void {
    this.router.navigate(['/tickets/form'], { queryParams: { id: this.ticketId } });
  }

  onBackToList(): void {
    this.router.navigate(['/tickets/list']);
  }

  // Check if current user can edit the ticket (only creator department can edit and only when ticket is Draft)
  canEditTicket(): boolean {
    if (!this.ticket || !this.currentUser) return false;
    // Check if current user's department name matches the department that created the ticket
    const isCreator = this.ticket.createdByDepartmentName === this.currentUser.departmentName;
    // Check if ticket is in Draft status
    const isDraft = this.ticket.ticketStatusName === 'Draft';
    
    return isCreator && isDraft;
  }

  // Check if current user can change status (creator department or assignee department)
  canChangeStatus(): boolean {
    if (!this.ticket || !this.currentUser) return false;
    
    // Check if user is from creator department
    if (this.ticket.createdByDepartmentName === this.currentUser.departmentName) return true;
    
    // Check if user is from assignee department
    // Note: assignees array contains departmentId, we need to match against current user's department
    // For now, we'll allow assignees to change status if there are assignees
    // TODO: Implement proper department ID to name mapping when available
    return this.ticket.assignees.length > 0;
  }

  // Get available status transitions for current user
  getAvailableStatusTransitions(): Array<{value: TicketStatus, label: string, color: string, actionLabel: string, statusId: string}> {
    if (!this.ticket || !this.currentUser || !this.canChangeStatus()) return [];
    
    // Determine user role based on department
    const userRole = this.ticket.createdByDepartmentName === this.currentUser.departmentName ? 'creator' : 'assignee';
    const ticketType = this.ticket.ticketTypeName as 'Report' | 'RFI'; // Use the name field
    
    // Use the new role-based method for filtering transitions
    const nextStatuses = this.ticketStatusService.getNextStatusesForUser(this.ticket.ticketStatusName, ticketType, userRole);
    
    return nextStatuses.map(status => ({
      ...status,
      statusId: TicketStatusHelpers.getStatusConfig(status.value)?.id || '',
      actionLabel: this.ticketStatusService.getActionLabel(
        this.ticket!.ticketStatusName, 
        status.value, 
        ticketType, 
        userRole
      )
    }));
  }

  // Handle status change using the new API endpoint
  onStatusChange(statusId: string, statusName: string): void {
    if (!this.ticket || !this.currentUser) return;

    this.ticketService.updateTicketStatus(this.ticketId, statusId).subscribe({
      next: (updatedTicket) => {
        // Update the entire ticket object with the response from the API
        this.ticket = updatedTicket;
        // Trigger change detection to ensure UI updates
        this.cdr.detectChanges();
        this.snackBar.open(
          `Ticket status updated to ${updatedTicket.ticketStatusName}`, 
          'Close', 
          { duration: 3000 }
        );
      },
      error: (error) => {
        console.error('Error updating ticket status:', error);
        this.snackBar.open(
          'Failed to update ticket status', 
          'Close', 
          { duration: 3000 }
        );
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  getStatusColor(status: string): string {
    return TicketStatusHelpers.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Draft': 'edit',
      'Pending': 'hourglass_empty',
      'In progress': 'work',
      'In review': 'visibility',
      'Need Revision': 'edit_note',
      'Completed': 'check_circle'
    };
    return iconMap[status] || 'radio_button_unchecked';
  }

  formatDate(dateString: string): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  downloadFile(file: any): void {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(file.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.contentType });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  }
}