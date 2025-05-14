import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { Place } from './place.model';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  constructor() {
    // Reset dei luoghi preferiti quando l'utente effettua il logout
    effect(() => {
      if (!this.authService.authStatus()) {
        this.userPlaces.set([]);
      }
    });
  }

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Errore nel caricamento dei luoghi disponibili. Riprova più tardi.'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Errore nel caricamento dei luoghi preferiti.'
    ).pipe(
      tap(places => {
        this.userPlaces.set(places);
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    return this.httpClient
      .put<{ userPlaces: Place[] }>('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        tap(response => {
          this.userPlaces.set(response.userPlaces);
        })
      );
  }

  removeUserPlace(place: Place) {
    // Aggiorna immediatamente lo stato locale
    this.userPlaces.update(places => places.filter(p => p.id !== place.id));
    
    return this.httpClient
      .delete(`http://localhost:3000/user-places/${place.id}`)
      .pipe(
        tap(() => {
          // Conferma la rimozione nello stato locale
          this.userPlaces.update(places => places.filter(p => p.id !== place.id));
        })
      );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient
      .get<{ places: Place[] }>(url)
      .pipe(
        map((resData) => resData.places),
        catchError((error) => {
          console.error('Error fetching places:', error);
          return throwError(() => new Error(errorMessage));
        })
      );
  }
}
