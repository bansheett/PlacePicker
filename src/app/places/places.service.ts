import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient)
  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something went wrong fetching the available places. Please try again later.')
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Failed to fetch user places.'
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
    return this.httpClient
    .delete<{ userPlaces: Place[] }>(`http://localhost:3000/user-places/${place.id}`)
    .pipe(
      tap(response => {
        this.userPlaces.set(response.userPlaces);
      })
    );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient
      .get<{ places: Place[] }>(url)
      .pipe(
        map((resData) => resData.places),
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error(errorMessage));
        })
      )
  }
}
