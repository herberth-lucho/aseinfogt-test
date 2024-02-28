import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-no-data-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule, NgOptimizedImage],
  templateUrl: './no-data-card.component.html',
})
export class NoDataCardComponent {}
