import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Place } from '../place.model';
import { HttpClient } from '@angular/common/http';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit{
    places = signal<Place[] | undefined>(undefined);
    isFetching = signal(false);
    error = signal('');
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService)

    ngOnInit() {
      this.isFetching.set(true);
      const subscription = this.placesService.loadUserPlaces()
        .subscribe({
          next: (places: Place[] | undefined) => {
            this.places.set(places);
          },
          error: (error: Error) => {
            this.error.set(error.message);
          },
          complete: () => {
            this.isFetching.set(false);
          }
        });
      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    }

    onRemovePlace(place: Place) {
      this.placesService.removeUserPlace(place).subscribe({
        next: () => {
          this.error.set('');
          setTimeout(() => {
            this.error.set('Luogo rimosso dai preferiti!');
            setTimeout(() => this.error.set(''), 2000);
          }, 0);
        },
        error: (error) => {
          this.error.set('Errore nella rimozione del luogo dai preferiti. Riprova più tardi.');
        }
      });
    }
  }    