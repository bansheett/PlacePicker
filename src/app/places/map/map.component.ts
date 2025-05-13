import { AfterViewInit, Component, Input } from '@angular/core';
import * as L from 'leaflet';
import { Place } from '../place.model';

@Component({
  selector: 'app-map',
  standalone: true,
  template: '<div id="map" style="height: 400px; margin: 20px 0; border-radius: 8px;"></div>',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class MapComponent implements AfterViewInit {
  @Input() places: Place[] = [];
  private map!: L.Map;

  ngAfterViewInit() {
    this.initMap();
    
    // Necessario per caricare correttamente gli stili di Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  private initMap(): void {
    // Se non ci sono luoghi, centra la mappa sul mondo
    const defaultCenter: L.LatLngExpression = [0, 0];
    const defaultZoom = 2;

    this.map = L.map('map').setView(defaultCenter, defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Aggiungi i marker per ogni luogo
    this.places.forEach(place => {
      L.marker([place.lat, place.lon])
        .bindPopup(`
          <h3>${place.title}</h3>
          <img src="/images/${place.image.src}" alt="${place.image.alt}" style="width: 200px; border-radius: 4px;">
          <p>${place.image.alt}</p>
        `)
        .addTo(this.map);
    });

    // Se ci sono luoghi, centra la mappa sul loro bounding box
    if (this.places.length > 0) {
      const bounds = L.latLngBounds(this.places.map(place => [place.lat, place.lon]));
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}
