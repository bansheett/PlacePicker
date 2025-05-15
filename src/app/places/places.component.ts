import { Component, input, output, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';

import { PlacesContainerComponent } from './places-container/places-container.component';
import { Place } from './place.model';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [NgIf],
  templateUrl: './places.component.html',
  styleUrl: './places.component.css',
})
export class PlacesComponent {
  places = input.required<Place[]>();
  showRemoveButton = input<boolean>(false);
  selectPlace = output<Place>();
  removePlace = output<Place>();
  highlightPlace = output<Place>();

  private container = inject(PlacesContainerComponent);

  selectedPlace = signal<Place | null>(null);

  onSelectPlace(place: Place) {
    this.selectPlace.emit(place);
  }

  onRemovePlace(place: Place) {
    this.removePlace.emit(place);
  }

  onImageClick(place: Place) {
    this.highlightPlace.emit(place);
    this.container.scrollToMap();
  }

  onShowDescription(place: Place) {
    this.selectedPlace.set(place);
  }

  onCloseDescription() {
    this.selectedPlace.set(null);
  }
}
