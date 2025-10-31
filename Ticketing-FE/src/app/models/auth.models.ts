export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  id: string; // Guid from .NET
  username: string;
  departmentName: string;
  departmentType: string;
  token: string;
}

export interface User {
  id: string;
  username: string;
  departmentName: string;
  departmentType: string;
}