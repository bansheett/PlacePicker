import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { Subscription } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent]
})
export class AvailablePlacesComponent implements OnInit{
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  highlightedPlace = signal<Place | null>(null);
  private placesService = inject(PlacesService)
  private destroyRef = inject(DestroyRef);

  //constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.isFetching.set(true);
    const subscription = 
    this.placesService.loadAvailablePlaces().subscribe({
      next: (places) => {
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

  onSelectPlace(selectedPlace: Place) {
    this.placesService.addPlaceToUserPlaces(selectedPlace).subscribe({
      next: () => {
        this.error.set('');
        setTimeout(() => {
          this.error.set('Luogo aggiunto ai preferiti!');
          setTimeout(() => this.error.set(''), 2000);
        }, 0);
      },
      error: (error) => {
        this.error.set('Errore nell\'aggiunta del luogo ai preferiti. Riprova più tardi.');
      }
    });
}

  onHighlightPlace(place: Place) {
    this.highlightedPlace.set(place);
  }
}