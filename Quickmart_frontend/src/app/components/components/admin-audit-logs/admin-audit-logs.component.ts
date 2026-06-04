import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-audit-logs.component.html'
})
export class AdminAuditLogsComponent implements OnInit {
  logs: any[] = [];
  selectedLog: any = null;
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLogs();
  }

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
  }

  loadLogs() {
    this.http.get<any[]>(`${this.apiUrl}/admin/audit-logs`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.logs = data;
        },
        error: (err) => console.error('Failed to load audit logs', err)
      });
  }

  viewLogDetails(log: any) {
    this.selectedLog = log;
  }

  closeLogDetails() {
    this.selectedLog = null;
  }
}
