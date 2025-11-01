import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TicketService } from '../services/ticket.service';
import { TicketListItemDto } from '../models/ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TicketListResolver implements Resolve<TicketListItemDto[]> {
  
  constructor(private ticketService: TicketService) {}
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TicketListItemDto[]> {
    // Use real API call now
    return this.ticketService.getAllTickets();
    
    // TODO: Remove dummy data below when API is confirmed working
    // Dummy data for fallback (keep for now in case of API issues)
    /*
    const dummyTickets: TicketResponseDto[] = [
      {
        id: '1',
        type: 'Bug Report',
        subject: 'Login page not loading properly',
        assignee: 'John Smith - IT Support',
        description: 'Users are reporting that the login page takes too long to load and sometimes shows a blank screen.',
        alertBuffer: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        attachments: [
          {
            id: 'att1',
            fileName: 'screenshot-error.png',
            fileSize: 245760,
            contentType: 'image/png',
            uploadDate: new Date().toISOString()
          }
        ],
        createdBy: 'user1',
        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        status: 'Open',
        department: 'IT Department'
      },
      {
        id: '2',
        type: 'Feature Request',
        subject: 'Add dark mode to application',
        assignee: 'Sarah Johnson - Senior Developer',
        description: 'Multiple users have requested a dark mode option for better accessibility and reduced eye strain.',
        alertBuffer: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        attachments: [],
        createdBy: 'user2',
        createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        status: 'In Progress',
        department: 'Development'
      },
      {
        id: '3',
        type: 'Hardware Issue',
        subject: 'Printer not working in office 204',
        assignee: 'Mike Wilson - System Admin',
        description: 'The network printer in office 204 is not responding to print jobs. Error message appears on display.',
        alertBuffer: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        attachments: [
          {
            id: 'att2',
            fileName: 'printer-error-log.txt',
            fileSize: 5120,
            contentType: 'text/plain',
            uploadDate: new Date().toISOString()
          }
        ],
        createdBy: 'user3',
        createdDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        status: 'Open',
        department: 'Facilities'
      }
    ];
    
    return of(dummyTickets);
    */
  }
}