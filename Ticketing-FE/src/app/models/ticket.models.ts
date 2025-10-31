// Lookup DTOs
export interface LookupDto {
  id: string;
  name: string;
}

// Assignee DTO for backend
export interface TicketAssigneeDto {
  departmentId: string;
  ticketAssigneeType: string;
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
  subject: string;
  description: string;
  alertBuffer: string; // ISO date string
  deadline: string; // ISO date string
  ticketStatus: string;
  assignees: TicketAssigneeDto[]; // Backend sends array, but count is always 1
  files: TicketFileDto[];
  createdBy: string;
  createdDate: string;
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