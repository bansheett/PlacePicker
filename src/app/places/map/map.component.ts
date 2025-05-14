import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() places: Place[] = [];
  @Input() highlightedPlace: Place | null = null;
  private map!: L.Map;
  private markers: L.Marker[] = [];

  ngAfterViewInit() {
    this.initMap();
    
    // Necessario per caricare correttamente gli stili di Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Aggiungiamo i marker dopo l'inizializzazione della mappa
    this.updateMarkers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['places'] && this.map) {
      this.updateMarkers();
    }
    if (changes['highlightedPlace'] && this.map && this.highlightedPlace) {
      this.highlightPlace(this.highlightedPlace);
    }
  }

  private initMap(): void {
    // Se non ci sono luoghi, centra la mappa sul mondo
    const defaultCenter: L.LatLngExpression = [0, 0];
    const defaultZoom = 2;

    this.map = L.map('map').setView(defaultCenter, defaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private updateMarkers(): void {
    // Rimuovi i marker esistenti
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Aggiungi i nuovi marker
    this.places.forEach(place => {
      const marker = L.marker([place.lat, place.lon])
        .bindPopup(`
          <div>
            <h3>${place.title}</h3>
            <img src="http://localhost:3000/${place.image.src}" alt="${place.image.alt}" style="max-width: 200px">
          </div>
        `);
      marker.addTo(this.map);
      this.markers.push(marker);
    });
  }

  private highlightPlace(place: Place): void {
    // Centra la mappa sul luogo selezionato con animazione
    this.map.setView([place.lat, place.lon], 8, {
      animate: true,
      duration: 1
    });

    // Trova e apri il popup del marker corrispondente
    const marker = this.markers.find(m => 
      m.getLatLng().lat === place.lat && 
      m.getLatLng().lng === place.lon
    );
    if (marker) {
      marker.openPopup();
    }
  }
}
