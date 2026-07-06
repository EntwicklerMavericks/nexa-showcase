import {
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ColumnConfig {
  key: string;
  label: string;
  hideOnMobile?: boolean;
}

@Directive({
  selector: '[nexaCustomCell]',
  standalone: true,
})
export class NexaCustomCellDirective {
  @Input('nexaCustomCell') columnName!: string;
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'nexa-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './nexa-data-table.component.html',
  styleUrls: ['./nexa-data-table.component.css'],
})
export class NexaDataTableComponent {
  // Inputs for Data and Columns
  @Input() data: any[] = [];
  @Input() columns: ColumnConfig[] = [];
  
  // Computed for MatTable
  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  // Inputs for Pagination
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;
  @Input() pageSizeOptions: number[] = [10, 20, 50];

  // Inputs for Empty State & Loading
  @Input() loading: boolean = false;
  @Input() emptyIcon: string = 'inbox';
  @Input() emptyMessage: string = 'Nenhum registro encontrado';
  @Input() emptyActionLabel?: string;

  // Outputs
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() emptyActionClick = new EventEmitter<void>();

  // Custom Content Projection for specific cells
  @ContentChildren(NexaCustomCellDirective) customCells!: QueryList<NexaCustomCellDirective>;

  getCustomTemplate(columnKey: string): TemplateRef<any> | null {
    if (!this.customCells) return null;
    const directive = this.customCells.find(c => c.columnName === columnKey);
    return directive ? directive.template : null;
  }

  onPage(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onEmptyAction() {
    this.emptyActionClick.emit();
  }

  onAction(action: string, row: any) {
    this.actionClick.emit({ action, row });
  }
}
