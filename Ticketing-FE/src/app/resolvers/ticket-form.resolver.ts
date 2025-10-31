import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TicketService } from '../services/ticket.service';
import { TicketFormResolverData, LookupDto } from '../models/ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TicketFormResolver implements Resolve<TicketFormResolverData> {
  
  constructor(private ticketService: TicketService) {}
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TicketFormResolverData> {
    const ticketId = route.queryParams['id'];
    
    // Use real API calls now
    return this.ticketService.getTicketFormData(ticketId);
    
    // TODO: Remove dummy data below when APIs are confirmed working
    // Dummy data for fallback (keep for now in case of API issues)
    /*
    const dummyTypes: LookupDto[] = [
      { id: '1', name: 'Bug Report' },
      { id: '2', name: 'Feature Request' },
      { id: '3', name: 'Technical Support' },
      { id: '4', name: 'Hardware Issue' },
      { id: '5', name: 'Software Issue' }
    ];
    
    const dummyAssignees: LookupDto[] = [
      { id: '1', name: 'John Smith - IT Support' },
      { id: '2', name: 'Sarah Johnson - Senior Developer' },
      { id: '3', name: 'Mike Wilson - System Admin' },
      { id: '4', name: 'Lisa Chen - QA Engineer' },
      { id: '5', name: 'David Brown - Project Manager' }
    ];
    
    const formData: TicketFormResolverData = {
      types: dummyTypes,
      assignees: dummyAssignees
    };
    
    // If editing, add dummy ticket data
    if (ticketId) {
      // TODO: Uncomment when getTicketById API is ready
      // formData.ticket = await this.ticketService.getTicketById(ticketId);
      
      // Dummy ticket data for edit mode
      formData.ticket = {
        id: ticketId,
        type: '1',
        subject: 'Sample Ticket Subject',
        assignee: '2',
        description: 'This is a sample ticket description for testing the edit mode functionality.',
        alertBuffer: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        attachments: [
          {
            id: 'att1',
            fileName: 'sample-document.pdf',
            fileSize: 1024000,
            contentType: 'application/pdf',
            uploadDate: new Date().toISOString()
          }
        ],
        createdBy: 'current-user',
        createdDate: new Date().toISOString(),
        status: 'Open',
        department: 'IT Department'
      };
    }
    
    return of(formData);
    */
  }
}