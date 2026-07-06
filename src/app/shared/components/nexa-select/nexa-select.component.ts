import { Component, Input, Output, EventEmitter, forwardRef, OnDestroy, OnInit, ContentChildren, QueryList, AfterContentInit, booleanAttribute } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { MatOption } from '@angular/material/core';

export interface NexaSelectOption {
  label: string;
  value: any;
  subLabel?: string;
}

@Component({
  selector: 'nexa-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatBottomSheetModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NexaSelectComponent),
      multi: true
    }
  ],
  templateUrl: './nexa-select.component.html',
  styleUrl: './nexa-select.component.scss',
})
export class NexaSelectComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterContentInit {
  @Input() label: string = '';
  @Input() placeholder?: string;
  @Input({ transform: booleanAttribute }) required: boolean = false;
  @Input({ transform: booleanAttribute }) disabled: boolean = false;
  @Input() options: NexaSelectOption[] = [];

  @Output() selectionChange = new EventEmitter<{value: any}>();

  @ContentChildren(MatOption) projectedOptions!: QueryList<MatOption>;

  value: any = null;
  isMobile: boolean = false;
  private destroy$ = new Subject<void>();

  onChange = (val: any) => {};
  onTouched = () => {};

  constructor(
    private bottomSheet: MatBottomSheet,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  ngAfterContentInit(): void {
    this.projectedOptions.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private buildMobileOptions(): NexaSelectOption[] {
    const mobileOptions: NexaSelectOption[] = [...this.options];
    if (this.projectedOptions && this.projectedOptions.length > 0) {
      this.projectedOptions.forEach(opt => {
        mobileOptions.push({
          label: opt.viewValue,
          value: opt.value
        });
      });
    }
    return mobileOptions;
  }

  getDisplayValue(): string {
    const allOptions = this.buildMobileOptions();
    const selectedOpt = allOptions.find(o => o.value === this.value);
    return selectedOpt ? selectedOpt.label : '';
  }

  onDesktopSelectionChange(newVal: any): void {
    this.value = newVal;
    this.onChange(newVal);
    this.onTouched();
    this.selectionChange.emit({ value: newVal });
  }

  openMobileSelector(): void {
    if (this.disabled) return;
    this.onTouched();

    import('./generic-selector-bottom-sheet.component').then(m => {
      const ref = this.bottomSheet.open(m.GenericSelectorBottomSheetComponent, {
        panelClass: 'nexa-bottom-sheet',
        data: { title: this.label || this.placeholder || 'Selecionar Opção', options: this.buildMobileOptions(), selectedValue: this.value }
      });
      ref.afterDismissed().subscribe(result => {
        if (result !== undefined) {
          this.value = result;
          this.onChange(result);
          this.selectionChange.emit({ value: result });
        }
      });
    });
  }
}
