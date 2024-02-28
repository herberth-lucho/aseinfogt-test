import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { Pokemon } from '../../models/pokemon.model';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { PokeAPIService } from '../../services/poke-api.service';

@Component({
  selector: 'app-modal-info',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, CommonModule, NgOptimizedImage],
  templateUrl: './modal-info.component.html',
  styleUrl: './modal-info.component.scss',
})
export class ModalInfoComponent implements OnInit {
  constructor(
    private pokeAPIService: PokeAPIService,
    @Inject(MAT_DIALOG_DATA) public pokemon: Pokemon
  ) {}

  ngOnInit(): void {
    this.getPokemon(this.pokemon.id);
  }

  private getPokemon(id: number): void {
    this.pokeAPIService
      .getPokemonFullInfo(id)
      .subscribe((p) => (this.pokemon = p));
  }
}
