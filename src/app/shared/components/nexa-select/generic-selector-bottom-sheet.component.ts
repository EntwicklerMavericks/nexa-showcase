import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface GenericSelectorOption {
  label: string;
  value: any;
  subLabel?: string;
}

export interface GenericSelectorData {
  title: string;
  options: GenericSelectorOption[];
  selectedValue?: any;
}

@Component({
  selector: 'app-generic-selector-bottom-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './generic-selector-bottom-sheet.component.html',
  styleUrl: './generic-selector-bottom-sheet.component.scss',
})
export class GenericSelectorBottomSheetComponent implements OnInit {
  searchQuery = '';
  filteredOptions: GenericSelectorOption[] = [];

  constructor(
    private bottomSheetRef: MatBottomSheetRef<GenericSelectorBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: GenericSelectorData
  ) {}

  ngOnInit(): void {
    this.filteredOptions = this.data.options;
  }

  filterOptions(): void {
    if (!this.searchQuery) {
      this.filteredOptions = this.data.options;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredOptions = this.data.options.filter(opt =>
      opt.label.toLowerCase().includes(q) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(q))
    );
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  selectOption(option: GenericSelectorOption): void {
    this.bottomSheetRef.dismiss(option.value);
  }
}
