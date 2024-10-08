import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userId: number | null = null;
  private tokenKey = 'userToken';
  constructor() {
    // Retrieve user ID from localStorage (or sessionStorage)
    this.userId = parseInt(localStorage.getItem('userId') || 'null', 10);
  }

  setUserId(id: number): void {
    this.userId = id;
    localStorage.setItem('userId', id.toString());
  }

  getUserId(): number | null {
    return this.userId;
  }

  clearUserId(): void {
    this.userId = null;
    localStorage.removeItem('userId');
  }
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
