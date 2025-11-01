import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  CreateTicketDto, 
  UpdateTicketDto, 
  TicketResponseDto, 
  LookupDto,
  TicketFormResolverData,
  TicketListItemDto
} from '../models/ticket.models';

// Interface for user API responses
interface UserApiResponse {
  id: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get ticket types lookup data
   * @returns Observable of ticket types (report/rfi)
   */
  getTicketTypes(): Observable<LookupDto[]> {
    return this.http.get<LookupDto[]>(`${this.API_BASE_URL}/TicketType`);
  }

  /**
   * Get report users (assignees for report tickets)
   * @returns Observable of report users
   */
  getReportUsers(): Observable<LookupDto[]> {
    return this.http.get<UserApiResponse[]>(`${this.API_BASE_URL}/User/report-user`)
      .pipe(
        map(users => users.map(user => ({
          id: user.id,
          name: user.username
        })))
      );
  }

  /**
   * Get RFI users (assignees for RFI tickets)
   * @returns Observable of RFI users
   */
  getRfiUsers(): Observable<LookupDto[]> {
    return this.http.get<UserApiResponse[]>(`${this.API_BASE_URL}/User/rfi-user`)
      .pipe(
        map(users => users.map(user => ({
          id: user.id,
          name: user.username
        })))
      );
  }

  /**
   * Get assignees based on ticket type
   * @param ticketType The type of ticket ('report' or 'rfi')
   * @returns Observable of assignees for the specific type
   */
  getAssigneesByType(ticketType: string): Observable<LookupDto[]> {
    const normalizedType = ticketType.toLowerCase();
    if (normalizedType === 'report') {
      return this.getReportUsers();
    } else if (normalizedType === 'rfi') {
      return this.getRfiUsers();
    } else {
      // Return empty array if type is unknown
      return of([]);
    }
  }

  /**
   * Get all assignees (both report and RFI users)
   * @returns Observable of all assignees
   */
  getAllAssignees(): Observable<LookupDto[]> {
    return forkJoin({
      report: this.getReportUsers(),
      rfi: this.getRfiUsers()
    }).pipe(
      switchMap(result => of([...result.report, ...result.rfi]))
    );
  }

  /**
   * Get ticket form data (for resolver)
   * @param ticketId Optional ticket ID for edit mode
   * @returns Observable of form data
   */
  getTicketFormData(ticketId?: string): Observable<TicketFormResolverData> {
    const types$ = this.getTicketTypes();
    const assignees$ = this.getAllAssignees(); // Get all assignees for the resolver

    if (ticketId) {
      const ticket$ = this.getTicketById(ticketId);
      return forkJoin({
        types: types$,
        assignees: assignees$,
        ticket: ticket$
      });
    } else {
      return forkJoin({
        types: types$,
        assignees: assignees$
      });
    }
  }

  /**
   * Get ticket by ID
   * @param ticketId The ticket ID
   * @returns Observable of ticket data
   */
  getTicketById(ticketId: string): Observable<TicketResponseDto> {
    return this.http.get<TicketResponseDto>(`${this.API_BASE_URL}/Ticket/${ticketId}`);
  }

  /**
   * Create a new ticket
   * @param ticketData The ticket data to create
   * @returns Observable of created ticket
   */
  createTicket(ticketData: CreateTicketDto): Observable<TicketResponseDto> {
    const formData = this.buildFormData(ticketData);
    return this.http.post<TicketResponseDto>(`${this.API_BASE_URL}/Ticket`, formData);
  }

  /**
   * Update an existing ticket
   * @param ticketData The ticket data to update
   * @returns Observable of updated ticket
   */
  updateTicket(ticketData: UpdateTicketDto): Observable<TicketResponseDto> {
    const formData = this.buildFormData(ticketData);
    return this.http.put<TicketResponseDto>(`${this.API_BASE_URL}/Ticket/${ticketData.id}`, formData);
  }

  /**
   * Update ticket status using the specific status update endpoint
   * @param ticketId The ticket ID to update
   * @param nextStatusId The next status ID to transition to
   * @returns Observable of updated ticket
   */
  updateTicketStatus(ticketId: string, nextStatusId: string): Observable<TicketResponseDto> {
    return this.http.put<TicketResponseDto>(`${this.API_BASE_URL}/Ticket/update-status/${ticketId}/${nextStatusId}`, {});
  }

  /**
   * Get all tickets (for list view)
   * @returns Observable of tickets array
   */
  getAllTickets(): Observable<TicketListItemDto[]> {
    return this.http.get<TicketListItemDto[]>(`${this.API_BASE_URL}/Ticket`);
  }

  /**
   * Delete a ticket
   * @param ticketId The ticket ID to delete
   * @returns Observable of void
   */
  deleteTicket(ticketId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/Ticket/${ticketId}`);
  }

  /**
   * Download attachment
   * @param attachmentId The attachment ID
   * @returns Observable of blob
   */
  downloadAttachment(attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.API_BASE_URL}/Ticket/attachments/${attachmentId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Build FormData for multipart upload
   * @param ticketData The ticket data
   * @returns FormData object
   */
  private buildFormData(ticketData: CreateTicketDto | UpdateTicketDto): FormData {
    const formData = new FormData();
    
    // Add basic ticket properties
    formData.append('ticketTypeId', ticketData.ticketTypeId);
    formData.append('subject', ticketData.subject);
    formData.append('description', ticketData.description);
    formData.append('alertBuffer', ticketData.alertBuffer);
    formData.append('deadline', ticketData.deadline);
    formData.append('ticketStatus', ticketData.ticketStatus);

    // Add assignee as simple string
    if (ticketData.assigneeDepartmentId) {
      formData.append('assigneeDepartmentId', ticketData.assigneeDepartmentId);
    }

    // Add files from base64 data
    if (ticketData.files && ticketData.files.length > 0) {
      ticketData.files.forEach((fileDto, index) => {
        // Convert base64 back to blob for FormData
        const byteCharacters = atob(fileDto.fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileDto.contentType });
        
        formData.append('files', blob, fileDto.fileName);
      });
    }

    // Add id for update operations
    if ('id' in ticketData) {
      formData.append('id', ticketData.id);
    }

    return formData;
  }
}