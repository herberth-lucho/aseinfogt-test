import { Observable, toArray } from 'rxjs';
import { PokeAPIService } from '../../shared/services/poke-api.service';
import { Component, OnInit } from '@angular/core';
import { Pokemon } from '../../shared/models/pokemon.model';
import { CardsComponent } from '../../shared/components/cards/cards.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalInfoComponent } from '../../shared/components/modal-info/modal-info.component';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { PokeResult } from '../../shared/models/pokemon-list.model';
import { NoDataCardComponent } from '../../shared/components/no-data-card/no-data-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CardsComponent,
    ModalInfoComponent,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    FormsModule,
    NoDataCardComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  pokemons: Pokemon[] = [];
  backPokemons: Pokemon[] = [];
  limit = '20';
  limitList = ['12', '20', '52', '100', '200'];
  searchPoke = '';
  isFound = true;
  sort = 'id';
  sortList = [
    { id: 'id', name: 'Id' },
    { id: 'name', name: 'Nombre' },
    { id: 'type', name: 'Tipo' },
    { id: 'ability', name: 'Habilidad' },
  ];
  flow = 'asc';
  flowList = [
    { id: 'asc', name: 'ASC' },
    { id: 'desc', name: 'DESC' },
  ];
  spinner = false;

  myControl = new FormControl('');
  filteredOptions!: Observable<Pokemon[]>;

  constructor(
    private pokeAPIService: PokeAPIService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getData();

    let typed = '';
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      tap((data) => {
        this.isFound = true;
        if (data === '') {
          this.pokemons = this.backPokemons;
        } else {
          typed = data || '';
        }
      }),
      map((value: any) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.pokemons.slice();
      }),
      tap((data) => {
        this.pokemons = data;
        if (data.length === 0) {
          this.getPokemon(typed);
        }
      })
    );
  }

  openModal(pokemon: Pokemon): void {
    this.dialog.open(ModalInfoComponent, {
      width: '55vw', // Set width to 60 percent of view port width
      height: '55vh',
      data: pokemon,
    });
  }

  onLimitChange(event: string) {
    this.limit = event;
    this.getData();
  }

  getData() {
    this.pokeAPIService
      .getAllPokemon(this.limit)
      .pipe(toArray())
      .subscribe((p: any[]) => {
        this.pokemons = p.map((poke) => ({
          id: poke.id,
          name: poke.name,
          types: poke.types.map((t: any) =>
            t.type.name
              .split(' ')
              .map((l: string) => l[0].toUpperCase() + l.substring(1))
              .join(' ')
          ),
          abilities: poke.abilities.map((t: any) =>
            t.ability.name
              .split(' ')
              .map((l: string) => l[0].toUpperCase() + l.substring(1))
              .join(' ')
          ),
          imageUrl: poke.sprites.other['official-artwork'].front_default,
        }));
        this.onFlowChange('');
        this.backPokemons = this.pokemons;
      });
  }

  getPokemon(name: string) {
    this.spinner = true;
    this.pokeAPIService.getPokemonName(name).subscribe({
      next: (response) => {
        this.isFound = true;
        this.spinner = false;
        this.pokemons = response;
      },
      error: (error) => {
        console.error('There was an error in retrieving data from the server');
        this.isFound = false;
        this.spinner = false;
      },
    });
  }

  private _filter(name: string): Pokemon[] {
    const filterValue = name.toLowerCase();

    return this.pokemons.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  displayFn(pokemon: Pokemon): string {
    return pokemon && pokemon.name ? pokemon.name : '';
  }

  onSortChange(event: string) {
    switch (event) {
      case 'id':
        if (this.flow === 'asc') {
          this.pokemons.sort((a, b) => a.id - b.id);
        } else {
          this.pokemons.sort((a, b) => b.id - a.id);
        }
        break;
      case 'name':
        if (this.flow === 'asc') {
          this.pokemons.sort(
            (a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0)
          );
        } else {
          this.pokemons.sort(
            (a, b) => b.name.charCodeAt(0) - a.name.charCodeAt(0)
          );
        }
        break;
        break;
      case 'type':
        if (this.flow === 'asc') {
          this.pokemons.sort(
            (a, b) => a.types[0].charCodeAt(0) - b.types[0].charCodeAt(0)
          );
        } else {
          this.pokemons.sort(
            (a, b) => b.types[0].charCodeAt(0) - a.types[0].charCodeAt(0)
          );
        }
        break;
      case 'ability':
        if (this.flow === 'asc') {
          this.pokemons.sort(
            (a, b) =>
              a.abilities[0].charCodeAt(0) - b.abilities[0].charCodeAt(0)
          );
        } else {
          this.pokemons.sort(
            (a, b) =>
              b.abilities[0].charCodeAt(0) - a.abilities[0].charCodeAt(0)
          );
        }
        break;

      default:
        break;
    }
  }

  onFlowChange(event: string) {
    this.onSortChange(this.sort);
  }
}
