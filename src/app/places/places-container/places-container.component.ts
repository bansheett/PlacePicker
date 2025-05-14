import { Component, input, ViewChild, ElementRef } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { Place } from '../place.model';

@Component({
  selector: 'app-places-container',
  standalone: true,
  imports: [MapComponent],
  templateUrl: './places-container.component.html',
  styleUrl: './places-container.component.css'
})
export class PlacesContainerComponent {
  title = input.required<string>();
  places = input<Place[]>();
  highlightedPlace = input<Place | null>(null);
  @ViewChild('mapSection') mapSection!: ElementRef;

  scrollToMap() {
    this.mapSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
