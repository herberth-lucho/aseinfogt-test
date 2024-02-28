import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { Pokemon } from '../models/pokemon.model';
import { map, of, Observable, mergeMap, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokeAPIService {
  url = environment.urlServer + '/pokemon/?offset=0&limit={{limit}}';

  constructor(private http: HttpClient) {}

  getPokemonName(id: string): Observable<any> {
    return this.http.get<any>(`${environment.urlServer}/pokemon/${id}`).pipe(
      map((a: any) => [
        {
          id: a.id,
          name: a.name,
          types: a.types.map((t: any) =>
            t.type.name
              .split(' ')
              .map((l: string) => l[0].toUpperCase() + l.substring(1))
              .join(' ')
          ),
          abilities: a.abilities.map((t: any) =>
            t.ability.name
              .split(' ')
              .map((l: string) => l[0].toUpperCase() + l.substring(1))
              .join(' ')
          ),
          imageUrl: a.sprites.other['official-artwork'].front_default,
        },
      ])
    );
  }

  getAllPokemon(limit: string): Observable<any> {
    return this.http.get<any>(this.url.replace('{{limit}}', limit)).pipe(
      mergeMap((res) => res.results),
      mergeMap((a: any) => this.http.get(a.url))
    );
  }

  getPokemonFullInfo(id: number): Observable<any> {
    return this.http.get<any>(`${environment.urlServer}/pokemon/${id}`).pipe(
      mergeMap((poke: any) => {
        // Creamos los observables que posteriormente invocaremos
        const species$ = this.http.get<any>(poke.species.url).pipe(
          map((species) => ({
            // Lo mappeamos para que sea coherente con nuestra clase Pokemon
            description: species.flavor_text_entries.find(
              (entry: any) => entry.language.name === 'es'
            ).flavor_text,
            category: species.genera.find(
              (entry: any) => entry.language.name === 'es'
            ).genus,
            name: species.names.find(
              (entry: any) => entry.language.name === 'es'
            ).name,
          }))
        );
        const ability$ = this.http
          .get<any>(
            poke.abilities.find((entry: any) => entry.is_hidden === false)
              .ability.url
          )
          .pipe(
            map((ability) => ({
              ability: ability.names.find(
                (entry: any) => entry.language.name === 'es'
              ).name,
            }))
          );
        const weakness$ = this.getPokemonWeakness(
          poke.types.map((t: any) => t.type.name)
        ).pipe(
          map((res: any[]) => ({
            // Filtramos aquellas debilidades superiores a 1, además, también será necesario
            weakness: res
              .filter((w: any) => w.multiplier > 1)
              .map((t: any) =>
                t.type
                  .split(' ')
                  .map((l: string) => l[0].toUpperCase() + l.substring(1))
                  .join(' ')
              ),
          }))
        );

        return forkJoin([
          of({
            id: poke.id,
            types: poke.types.map((t: any) =>
              t.type.name
                .split(' ')
                .map((l: string) => l[0].toUpperCase() + l.substring(1))
                .join(' ')
            ),
            imageUrl: poke.sprites.other['official-artwork'].front_default,
            height: poke.height,
            weight: poke.weight,
          }),
          species$,
          ability$,
          weakness$,
        ]);
      }),
      map(
        ([pokemonInfo, descriptionInfo, abilityInfo, weakness]) =>
          ({
            ...pokemonInfo,
            ...descriptionInfo,
            ...abilityInfo,
            ...weakness,
          } as Pokemon)
      )
    );
  }

  getPokemonWeakness(types: string[]): Observable<any> {
    const urls = types.map((t) =>
      this.http.get<any>(
        `${environment.urlServer}/type/${t.toLocaleLowerCase()}`
      )
    );
    return forkJoin(urls).pipe(
      map((res) => {
        const weaknesses: any[] = [];
        for (const pokeType of res) {
          for (const doubleDamageFrom of pokeType.damage_relations
            .double_damage_from) {
            const existingWeakness = weaknesses.find(
              (weakness) => weakness.type === doubleDamageFrom.name
            );
            if (existingWeakness) {
              // Si ya existe la debilidad, actualiza el multiplicador
              existingWeakness.multiplier *= 2;
            } else {
              // Si no existe, crea una nueva debilidad
              weaknesses.push({
                type: doubleDamageFrom.name,
                multiplier: 2,
              });
            }
          }

          for (const halfDamageFrom of pokeType.damage_relations
            .half_damage_from) {
            const existingWeakness = weaknesses.find(
              (weakness) => weakness.type === halfDamageFrom.name
            );
            if (existingWeakness) {
              // Si ya existe la debilidad, actualiza el multiplicador
              existingWeakness.multiplier *= 0.5;
            } else {
              // Si no existe, crea una nueva debilidad
              weaknesses.push({
                type: halfDamageFrom.name,
                multiplier: 0.5,
              });
            }
          }

          for (const noDamageFrom of pokeType.damage_relations.no_damage_from) {
            const existingWeakness = weaknesses.find(
              (weakness) => weakness.type === noDamageFrom.name
            );
            if (existingWeakness) {
              // Si ya existe la debilidad, actualiza el multiplicador
              existingWeakness.multiplier = 0;
            } else {
              // Si no existe, crea una nueva debilidad
              weaknesses.push({
                type: noDamageFrom.name,
                multiplier: 0,
              });
            }
          }
        }

        return weaknesses;
      })
    );
  }
}
