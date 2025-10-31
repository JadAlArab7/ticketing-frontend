import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';
import { TicketService } from '../services/ticket.service';
import { User } from '../models/auth.models';
import { 
  LookupDto, 
  CreateTicketDto, 
  UpdateTicketDto, 
  TicketResponseDto,
  TicketFormResolverData,
  AttachmentDto,
  TicketFileDto,
  TicketAssigneeDto
} from '../models/ticket.models';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.sass'
})
export class TicketFormComponent implements OnInit {
  currentUser: User | null = null;
  ticketForm: FormGroup;
  isEditMode = false;
  ticketId: string | null = null;
  isLoading = false;
  
  // Lookup data from resolver
  types: LookupDto[] = [];
  assignees: LookupDto[] = [];
  
  // File attachments
  selectedFiles: File[] = [];
  existingFiles: TicketFileDto[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.ticketForm = this.fb.group({
      type: ['', Validators.required],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      assignee: [{ value: '', disabled: true }, Validators.required], // Initially disabled
      description: ['', [Validators.required, Validators.minLength(10)]],
      alertBuffer: ['', Validators.required],
      deadline: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Get data from resolver
    this.route.data.subscribe(data => {
      const resolverData: TicketFormResolverData = data['formData'];
      this.types = resolverData.types || [];
      this.assignees = resolverData.assignees || []; // Get all assignees from resolver
      
      if (resolverData.ticket) {
        this.isEditMode = true;
        this.ticketId = resolverData.ticket.id;
        this.existingFiles = resolverData.ticket.files || [];
        this.loadTicketData(resolverData.ticket);
      }
    });

    // Listen for ticket type changes to update assignees
    this.ticketForm.get('type')?.valueChanges.subscribe(typeId => {
      if (typeId) {
        this.loadAssigneesForType(typeId);
      }
    });
  }

  loadAssigneesForType(typeId: string): void {
    if (typeId) {
      // Enable the assignee field once type is selected
      // All assignees are already loaded from resolver, so just enable the field
      this.ticketForm.get('assignee')?.enable();
      
      // Clear the current assignee selection to force user to re-select
      // (since we can't filter by type with current data structure)
      const currentAssignee = this.ticketForm.get('assignee')?.value;
      if (currentAssignee && !this.isEditMode) {
        this.ticketForm.patchValue({ assignee: '' });
      }
    } else {
      // If no type is selected, disable the assignee field
      this.ticketForm.get('assignee')?.disable();
      this.ticketForm.patchValue({ assignee: '' });
    }
  }

  loadTicketData(ticket: TicketResponseDto): void {
    // Extract assignee from assignees array (backend sends array but count is always 1)
    const assigneeId = ticket.assignees && ticket.assignees.length > 0 
      ? ticket.assignees[0].departmentId 
      : '';

    this.ticketForm.patchValue({
      type: ticket.ticketTypeId,
      subject: ticket.subject,
      assignee: assigneeId,
      description: ticket.description,
      alertBuffer: new Date(ticket.alertBuffer),
      deadline: new Date(ticket.deadline)
    });
    
    // Enable assignee field if type is already selected in edit mode
    if (ticket.ticketTypeId) {
      this.ticketForm.get('assignee')?.enable();
    }
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  removeExistingAttachment(attachmentId: string): void {
    this.existingFiles = this.existingFiles.filter((file: TicketFileDto) => file.fileName !== attachmentId);
  }

  downloadAttachment(file: TicketFileDto): void {
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
      this.snackBar.open('Error downloading file', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Convert file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Convert files array to TicketFileDto array
   */
  private async convertFilesToTicketFiles(files: File[]): Promise<TicketFileDto[]> {
    const ticketFiles: TicketFileDto[] = [];
    
    for (const file of files) {
      try {
        const fileData = await this.fileToBase64(file);
        ticketFiles.push({
          fileName: file.name,
          contentType: file.type,
          fileData: fileData
        });
      } catch (error) {
        console.error(`Error converting file ${file.name} to base64:`, error);
        throw error;
      }
    }
    
    return ticketFiles;
  }

  async onSubmit(): Promise<void> {
    if (this.ticketForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    try {
      // Get form values including disabled controls
      const formValue = this.ticketForm.getRawValue();
      
      // Convert files to base64 format
      const files = await this.convertFilesToTicketFiles(this.selectedFiles);

      const ticketData: CreateTicketDto = {
        ticketTypeId: formValue.type,
        subject: formValue.subject,
        description: formValue.description,
        alertBuffer: formValue.alertBuffer.toISOString(),
        deadline: formValue.deadline.toISOString(),
        ticketStatus: 'open', // Default status - you may want to make this configurable
        assigneeDepartmentId: formValue.assignee, // Simple string ID of the assigned user
        files: files
      };

      // Use real API calls now
      const apiCall = this.isEditMode 
        ? this.ticketService.updateTicket({ ...ticketData, id: this.ticketId! } as UpdateTicketDto)
        : this.ticketService.createTicket(ticketData);

      apiCall.subscribe({
        next: (response) => {
          const action = this.isEditMode ? 'updated' : 'created';
          this.snackBar.open(`Ticket ${action} successfully!`, 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/tickets/list']);
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Ticket submission error:', error);
          let errorMessage = 'Error submitting ticket. Please try again.';
          
          if (error.status === 401) {
            errorMessage = 'Authentication required. Please login again.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid data. Please check your input.';
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error preparing ticket data:', error);
      this.snackBar.open('Error preparing files. Please try again.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }

    // TODO: Remove mock simulation below when API is confirmed working
    /*
    // Simulate API call for now
    setTimeout(() => {
      const action = this.isEditMode ? 'updated' : 'created';
      this.snackBar.open(`Ticket ${action} successfully! (Mock response)`, 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/tickets/list']);
      this.isLoading = false;
    }, 1500);
    */
  }

  onCancel(): void {
    this.router.navigate(['/tickets/list']);
  }

  onLogout(): void {
    this.authService.logout();
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  navigateToTicketList(): void {
    this.router.navigate(['/tickets/list']);
  }

  // Form validation getters
  get typeError(): string {
    const type = this.ticketForm.get('type');
    return type?.hasError('required') ? 'Type is required' : '';
  }

  get subjectError(): string {
    const subject = this.ticketForm.get('subject');
    if (subject?.hasError('required')) return 'Subject is required';
    if (subject?.hasError('minlength')) return 'Subject must be at least 5 characters';
    return '';
  }

  get assigneeError(): string {
    const assignee = this.ticketForm.get('assignee');
    if (assignee?.disabled) {
      return 'Please select a ticket type first';
    }
    return assignee?.hasError('required') ? 'Assignee is required' : '';
  }

  get descriptionError(): string {
    const description = this.ticketForm.get('description');
    if (description?.hasError('required')) return 'Description is required';
    if (description?.hasError('minlength')) return 'Description must be at least 10 characters';
    return '';
  }

  get alertBufferError(): string {
    const alertBuffer = this.ticketForm.get('alertBuffer');
    return alertBuffer?.hasError('required') ? 'Alert buffer date is required' : '';
  }

  get deadlineError(): string {
    const deadline = this.ticketForm.get('deadline');
    return deadline?.hasError('required') ? 'Deadline is required' : '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}