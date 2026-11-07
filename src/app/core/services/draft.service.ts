import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DraftService {
  private http = inject(HttpClient);

  saveDraftLocally(key: string, data: unknown): void {
    try {
      localStorage.setItem(`draft_${key}`, JSON.stringify(data));
    } catch {
      // storage quota exceeded — silently ignore
    }
  }

  loadDraft(key: string): unknown | null {
    try {
      const raw = localStorage.getItem(`draft_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  clearDraft(key: string): void {
    localStorage.removeItem(`draft_${key}`);
  }

  syncDraftToServer(id: string, data: unknown): Observable<void> {
    return this.http
      .put<void>(`/api/drafts/${id}`, { id, data, updatedAt: new Date().toISOString() })
      .pipe(catchError(() => of(void 0)));
  }

  loadDraftFromServer(id: string): Observable<{ id: string; data: unknown } | null> {
    return this.http
      .get<{ id: string; data: unknown }>(`/api/drafts/${id}`)
      .pipe(catchError(() => of(null)));
  }
}
