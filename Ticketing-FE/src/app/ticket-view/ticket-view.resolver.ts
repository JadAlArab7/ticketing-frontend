import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TicketService } from '../services/ticket.service';
import { TicketResponseDto } from '../models/ticket.models';

export const ticketViewResolver: ResolveFn<TicketResponseDto> = (route, state) => {
  const ticketService = inject(TicketService);
  const ticketId = route.paramMap.get('id');
  
  if (!ticketId) {
    throw new Error('Ticket ID is required');
  }
  
  return ticketService.getTicketById(ticketId);
};
