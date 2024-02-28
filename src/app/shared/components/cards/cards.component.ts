import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Pokemon } from '../../models/pokemon.model';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule, NgOptimizedImage],
  templateUrl: './cards.component.html',
})
export class CardsComponent {
  @Input() pokemon: Pokemon = {} as Pokemon;
  @Output() clicked = new EventEmitter<Pokemon>();

  onClicked(): void {
    this.clicked.emit(this.pokemon);
  }
}
