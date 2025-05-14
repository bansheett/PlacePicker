import { Component, input, output, inject } from '@angular/core';

import { PlacesContainerComponent } from './places-container/places-container.component';
import { Place } from './place.model';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [],
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
}
