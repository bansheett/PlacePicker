import { Component, input, output } from '@angular/core';

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

  onSelectPlace(place: Place) {
    this.selectPlace.emit(place);
  }

  onRemovePlace(place: Place) {
    this.removePlace.emit(place);
  }
}
