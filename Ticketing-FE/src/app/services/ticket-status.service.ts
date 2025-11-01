import { Injectable } from '@angular/core';
import { TicketStatus, TicketStatusHelpers, TicketStatusConfig } from '../models/ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TicketStatusService {

  constructor() {}

  /**
   * Get all available statuses
   */
  getAllStatuses(): Array<{value: TicketStatus, label: string, color: string}> {
    return TicketStatusHelpers.getAllStatusesOrdered().map(({status, config}) => ({
      value: status,
      label: config.name,
      color: config.color
    }));
  }

  /**
   * Get next possible statuses for a given status and ticket type
   */
  getNextStatuses(currentStatus: string, ticketType: 'Report' | 'RFI'): Array<{value: TicketStatus, label: string, color: string}> {
    const allowedTransitions = TicketStatusHelpers.getAllowedTransitions(currentStatus, ticketType);
    return allowedTransitions.map(status => {
      const config = TicketStatusConfig[status];
      return {
        value: status,
        label: config.name,
        color: config.color
      };
    });
  }

  /**
   * Get next possible statuses for a given status, ticket type, and user role
   */
  getNextStatusesForUser(currentStatus: string, ticketType: 'Report' | 'RFI', userRole: 'creator' | 'assignee'): Array<{value: TicketStatus, label: string, color: string}> {
    const allowedTransitions = TicketStatusHelpers.getAllowedTransitions(currentStatus, ticketType);
    
    // Filter transitions based on user role and workflow rules
    const roleBasedTransitions = allowedTransitions.filter(nextStatus => {
      
      if (ticketType === 'Report') {
        // Report workflow permissions:
        // Draft → In Review: creator only
        if (currentStatus === 'Draft' && nextStatus === TicketStatus.IN_REVIEW) {
          return userRole === 'creator';
        }
        
        // In Review → Need Revision: assignee only
        if (currentStatus === 'In review' && nextStatus === TicketStatus.NEED_REVISION) {
          return userRole === 'assignee';
        }
        
        // Need Revision → In Review: creator only
        if (currentStatus === 'Need Revision' && nextStatus === TicketStatus.IN_REVIEW) {
          return userRole === 'creator';
        }
        
        // In Review → Completed: assignee only
        if (currentStatus === 'In review' && nextStatus === TicketStatus.COMPLETED) {
          return userRole === 'assignee';
        }
        
        return true; // Default allow for other Report cases
      }
      
      if (ticketType === 'RFI') {
        // RFI workflow permissions:
        // Draft → Pending: creator only
        if (currentStatus === 'Draft' && nextStatus === TicketStatus.PENDING) {
          return userRole === 'creator';
        }
        
        // Pending → In Progress: assignee only
        if (currentStatus === 'Pending' && nextStatus === TicketStatus.IN_PROGRESS) {
          return userRole === 'assignee';
        }
        
        // In Progress → In Review: assignee only
        if (currentStatus === 'In progress' && nextStatus === TicketStatus.IN_REVIEW) {
          return userRole === 'assignee';
        }
        
        // In Review → Need Revision: creator only
        if (currentStatus === 'In review' && nextStatus === TicketStatus.NEED_REVISION) {
          return userRole === 'creator';
        }
        
        // In Review → Completed: creator only
        if (currentStatus === 'In review' && nextStatus === TicketStatus.COMPLETED) {
          return userRole === 'creator';
        }
        
        // Need Revision → In Review: assignee only
        if (currentStatus === 'Need Revision' && nextStatus === TicketStatus.IN_REVIEW) {
          return userRole === 'assignee';
        }
        
        return true; // Default allow for other RFI cases
      }
      
      return true; // Default allow for unknown ticket types
    });
    
    return roleBasedTransitions.map(status => {
      const config = TicketStatusConfig[status];
      return {
        value: status,
        label: config.name,
        color: config.color
      };
    });
  }

  /**
   * Check if a status transition is valid for the given ticket type
   */
  isValidTransition(fromStatus: string, toStatus: string, ticketType: 'Report' | 'RFI'): boolean {
    return TicketStatusHelpers.canTransitionTo(fromStatus, toStatus, ticketType);
  }

  /**
   * Get status ID by name (for backend calls)
   */
  getStatusId(statusName: string): string | null {
    const config = TicketStatusHelpers.getStatusConfig(statusName);
    return config ? config.id : null;
  }

  /**
   * Get status name by ID (for display)
   */
  getStatusName(statusId: string): string | null {
    const status = TicketStatusHelpers.getStatusByStatusId(statusId);
    return status ? TicketStatusConfig[status].name : null;
  }

  /**
   * Get status color for display
   */
  getStatusColor(statusName: string): string {
    return TicketStatusHelpers.getStatusColor(statusName);
  }

  /**
   * Check if status is final (no further transitions allowed) for given ticket type
   */
  isFinalStatus(statusName: string, ticketType: 'Report' | 'RFI'): boolean {
    const allowedTransitions = TicketStatusHelpers.getAllowedTransitions(statusName, ticketType);
    return allowedTransitions.length === 0;
  }

  /**
   * Get status order for sorting
   */
  getStatusOrder(statusName: string): number {
    const config = TicketStatusHelpers.getStatusConfig(statusName);
    return config ? config.order : 999;
  }

  /**
   * Get workflow progression percentage for a specific ticket type
   */
  getProgressPercentage(statusName: string, ticketType: 'Report' | 'RFI'): number {
    const config = TicketStatusHelpers.getStatusConfig(statusName);
    if (!config) return 0;
    
    const workflowSteps = TicketStatusHelpers.getWorkflowSteps(ticketType);
    const currentIndex = workflowSteps.findIndex(step => step === statusName);
    
    if (currentIndex === -1) return 0;
    
    return Math.round(((currentIndex + 1) / workflowSteps.length) * 100);
  }

  /**
   * Get workflow steps for a specific ticket type
   */
  getWorkflowSteps(ticketType: 'Report' | 'RFI'): Array<{value: TicketStatus, label: string, color: string, order: number}> {
    const steps = TicketStatusHelpers.getWorkflowSteps(ticketType);
    return steps.map(status => {
      const config = TicketStatusConfig[status];
      return {
        value: status,
        label: config.name,
        color: config.color,
        order: config.order
      };
    });
  }

  /**
   * Get action label for status transition
   */
  getActionLabel(fromStatus: string, toStatus: string, ticketType: 'Report' | 'RFI', userRole: 'creator' | 'assignee'): string {
    return TicketStatusHelpers.getActionLabel(fromStatus, toStatus, ticketType, userRole);
  }
}