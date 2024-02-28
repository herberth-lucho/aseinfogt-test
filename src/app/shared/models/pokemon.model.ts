export type PokemonType =
  | 'Normal'
  | 'Fighting'
  | 'Flying'
  | 'Poison'
  | 'Ground'
  | 'Rock'
  | 'Bug'
  | 'Ghost'
  | 'Steel'
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Electric'
  | 'Psychic'
  | 'Ice'
  | 'Dragon'
  | 'Dark'
  | 'Fairy'
  | 'Unknown'
  | 'Shadow';

export interface Pokemon {
  imageUrl: string;
  id: number;
  name: string;
  types: PokemonType[];
  description?: string;
  height?: number;
  weight?: number;
  category?: string;
  ability?: string;
  weakness?: PokemonType[];
  abilities: string[];
}
