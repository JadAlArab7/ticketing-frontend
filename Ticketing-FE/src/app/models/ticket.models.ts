// Ticket Status Enum
export enum TicketStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  IN_PROGRESS = 'In progress',
  IN_REVIEW = 'In review',
  COMPLETED = 'Completed',
  NEED_REVISION = 'Need Revision'
}

// Ticket Status with IDs (for backend integration)
export const TicketStatusConfig = {
  [TicketStatus.DRAFT]: {
    id: '9921a92c-c0f7-4c14-95c5-3774e5c3d81b',
    name: 'Draft',
    color: 'accent',
    order: 1,
    allowedTransitions: {
      'Report': [TicketStatus.IN_REVIEW], // Creator presses "Send" → In Review
      'RFI': [TicketStatus.PENDING] // Creator presses "Send" → Pending
    }
  },
  [TicketStatus.PENDING]: {
    id: 'a5f316aa-7237-4f8a-8014-5f1007075c79',
    name: 'Pending',
    color: 'warn',
    order: 2,
    allowedTransitions: {
      'Report': [], // Not used in Report workflow
      'RFI': [TicketStatus.IN_PROGRESS] // Assignee presses "Start" → In Progress
    }
  },
  [TicketStatus.IN_PROGRESS]: {
    id: '717551bf-5946-4c0e-a025-9c36ee3c549f',
    name: 'In progress',
    color: 'primary',
    order: 3,
    allowedTransitions: {
      'Report': [], // Not used in Report workflow
      'RFI': [TicketStatus.IN_REVIEW] // Assignee presses "Send" → In Review
    }
  },
  [TicketStatus.IN_REVIEW]: {
    id: 'd294ae42-fd7d-4a2d-9ff9-829d788e60d0',
    name: 'In review',
    color: 'primary',
    order: 4,
    allowedTransitions: {
      'Report': [TicketStatus.COMPLETED, TicketStatus.NEED_REVISION], // Assignee: "Approve" → Completed OR "Need Revision"
      'RFI': [TicketStatus.COMPLETED, TicketStatus.NEED_REVISION] // Creator: "Approve" → Completed OR "Need Revision"
    }
  },
  [TicketStatus.COMPLETED]: {
    id: '551388b7-4420-4454-bc64-3055be9900bf',
    name: 'Completed',
    color: 'primary',
    order: 5,
    allowedTransitions: {
      'Report': [], // Final state
      'RFI': [] // Final state
    }
  },
  [TicketStatus.NEED_REVISION]: {
    id: '45ab3f52-1ff6-491a-8c5a-2af874820f45',
    name: 'Need Revision',
    color: 'warn',
    order: 6,
    allowedTransitions: {
      'Report': [TicketStatus.IN_REVIEW], // Creator presses "Send" again → In Review
      'RFI': [TicketStatus.IN_REVIEW] // Assignee presses "Send" again → In Review
    }
  }
} as const;

// Helper functions for ticket status
export const TicketStatusHelpers = {
  /**
   * Get status configuration by name
   */
  getStatusConfig: (statusName: string) => {
    const status = Object.values(TicketStatus).find(s => s === statusName);
    return status ? TicketStatusConfig[status] : null;
  },

  /**
   * Get status by ID
   */
  getStatusByStatusId: (statusId: string): TicketStatus | null => {
    const entry = Object.entries(TicketStatusConfig).find(([_, config]) => config.id === statusId);
    return entry ? entry[0] as TicketStatus : null;
  },

  /**
   * Get allowed transitions for a status based on ticket type
   */
  getAllowedTransitions: (currentStatus: string, ticketType: 'Report' | 'RFI'): TicketStatus[] => {
    const config = TicketStatusHelpers.getStatusConfig(currentStatus);
    if (!config) return [];
    
    const transitions = config.allowedTransitions[ticketType];
    return transitions ? [...transitions] : [];
  },

  /**
   * Check if transition is allowed for specific ticket type
   */
  canTransitionTo: (fromStatus: string, toStatus: string, ticketType: 'Report' | 'RFI'): boolean => {
    const allowedTransitions = TicketStatusHelpers.getAllowedTransitions(fromStatus, ticketType);
    return allowedTransitions.includes(toStatus as TicketStatus);
  },

  /**
   * Get color for status
   */
  getStatusColor: (statusName: string): string => {
    const config = TicketStatusHelpers.getStatusConfig(statusName);
    return config ? config.color : '';
  },

  /**
   * Get all statuses ordered by workflow
   */
  getAllStatusesOrdered: (): Array<{status: TicketStatus, config: typeof TicketStatusConfig[TicketStatus]}> => {
    return Object.entries(TicketStatusConfig)
      .map(([status, config]) => ({ status: status as TicketStatus, config }))
      .sort((a, b) => a.config.order - b.config.order);
  },

  /**
   * Get workflow steps for a specific ticket type
   */
  getWorkflowSteps: (ticketType: 'Report' | 'RFI'): TicketStatus[] => {
    if (ticketType === 'Report') {
      return [TicketStatus.DRAFT, TicketStatus.IN_REVIEW, TicketStatus.COMPLETED];
    } else {
      return [TicketStatus.DRAFT, TicketStatus.PENDING, TicketStatus.IN_PROGRESS, TicketStatus.IN_REVIEW, TicketStatus.COMPLETED];
    }
  },

  /**
   * Get action labels for status transitions
   */
  getActionLabel: (fromStatus: string, toStatus: string, ticketType: 'Report' | 'RFI', userRole: 'creator' | 'assignee'): string => {
    const key = `${fromStatus}->${toStatus}-${ticketType}-${userRole}`;
    
    const actionLabels: Record<string, string> = {
      // Report workflow
      'Draft->In review-Report-creator': 'Send',
      'In review->Completed-Report-assignee': 'Approve',
      'In review->Need Revision-Report-assignee': 'Need Revision',
      'Need Revision->In review-Report-creator': 'Send',
      
      // RFI workflow
      'Draft->Pending-RFI-creator': 'Send',
      'Pending->In progress-RFI-assignee': 'Start',
      'In progress->In review-RFI-assignee': 'Send',
      'In review->Completed-RFI-creator': 'Approve',
      'In review->Need Revision-RFI-creator': 'Need Revision',
      'Need Revision->In review-RFI-assignee': 'Send'
    };
    
    return actionLabels[key] || 'Update Status';
  }
};

// Lookup DTOs
export interface LookupDto {
  id: string;
  name: string;
}

// Assignee DTO for backend
export interface TicketAssigneeDto {
  ticketId: string;
  departmentId: string;
  departmentName: string; // Human-readable department name
  ticketAssigneeType: string;
  ticketAssigneeTypeName: string; // Human-readable assignee type name
}

// File DTO for backend
export interface TicketFileDto {
  fileName: string;
  contentType: string;
  fileData: string; // Base64 encoded file data
}

// Ticket DTOs
export interface CreateTicketDto {
  ticketTypeId: string;
  subject: string;
  description: string;
  alertBuffer: string; // ISO date string
  deadline: string; // ISO date string
  ticketStatus: string;
  assigneeDepartmentId: string; // ID of the assigned user
  files: TicketFileDto[];
}

export interface UpdateTicketDto {
  id: string;
  ticketTypeId: string;
  subject: string;
  description: string;
  alertBuffer: string; // ISO date string
  deadline: string; // ISO date string
  ticketStatus: string;
  assigneeDepartmentId: string; // ID of the assigned user
  files: TicketFileDto[];
}

export interface TicketResponseDto {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string; // Human-readable type name
  subject: string;
  description: string;
  alertBuffer: string; // ISO date string
  deadline: string; // ISO date string
  ticketStatus: string; // Status ID
  ticketStatusName: string; // Human-readable status name
  assignees: TicketAssigneeDto[]; // Backend sends array, but count is always 1
  files: TicketFileDto[];
  createdBy: string; // ID of the department that created the ticket
  createdByDepartmentName: string; // Name of the department that created the ticket
  createdAt: string; // Updated field name to match API
}

export interface AttachmentDto {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
}

export interface TicketFormResolverData {
  types: LookupDto[];
  assignees: LookupDto[]; // All assignees (both report and RFI)
  ticket?: TicketResponseDto; // For edit mode
}

// Ticket List Response DTO (from API)
export interface TicketListItemDto {
  id: string;
  subject: string;
  ticketTypeName: string;
  ticketStatusName: string;
  assignedToDepartments: string[];
  deadline: string;
  createdAt: string;
  createdByDepartmentName: string;
}