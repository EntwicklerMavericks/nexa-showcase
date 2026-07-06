import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { Produto, ProdutosService } from '../../produtos/services/produtos.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface ProdutoSelectorData {
  initialTerm?: string;
}

@Component({
  selector: 'app-produto-selector-bottom-sheet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatButtonModule
  ],
  template: `
    <div class="bottom-sheet-container">
      <div class="header">
        <h3 style="margin: 0; font-size: 18px; font-weight: 500;">Buscar Produto</h3>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="search-container">
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Pesquisar (Nome, SKU, Cód. Barras)</mat-label>
          <input
            matInput
            [formControl]="searchControl"
            #searchInput
            placeholder="Digite para buscar..."
            autocomplete="off"
          />
          <mat-icon matPrefix>search</mat-icon>
          @if (searchControl.value) {
            <button mat-icon-button matSuffix (click)="clearSearch()">
              <mat-icon>clear</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      <div class="results-container">
        @if (isLoading) {
          <div class="loading-state">Buscando produtos...</div>
        } @else if (produtos.length === 0 && searchControl.value) {
          <div class="empty-state">Nenhum produto encontrado.</div>
        } @else {
          <mat-nav-list>
            @for (p of produtos; track p.id) {
              <a mat-list-item (click)="selectProduto(p)" class="produto-item">
                <span matListItemTitle class="prod-title">{{ p.nome }}</span>
                <span matListItemLine class="prod-subtitle">{{ p.sku }} — {{ p.unidade }}</span>
              </a>
            }
          </mat-nav-list>
        }
      </div>
    </div>
  `,
  styles: [`
    .bottom-sheet-container {
      display: flex;
      flex-direction: column;
      height: 85vh; /* Ocupa quase a tela toda */
      padding-top: 16px;
      background-color: #1a1a1a; /* Fundo sólido escuro para não vazar a tela de trás */
      color: #dfdfdf;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      margin-bottom: 8px;
    }
    .search-container {
      padding: 0 16px;
      flex-shrink: 0;
    }
    .results-container {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 24px;
    }
    .loading-state, .empty-state {
      padding: 24px;
      text-align: center;
      color: #888;
    }
    .produto-item {
      height: auto !important;
      padding: 12px 16px !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 0 !important;
    }
    .prod-title {
      white-space: normal !important;
      line-height: 1.4 !important;
      font-size: 15px !important;
      margin-bottom: 4px !important;
      color: #dfdfdf;
    }
    .prod-subtitle {
      color: #999;
      font-size: 13px !important;
    }
  `]
})
export class ProdutoSelectorBottomSheetComponent implements OnInit, AfterViewInit {
  searchControl = new FormControl('');
  produtos: Produto[] = [];
  isLoading = false;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<ProdutoSelectorBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: ProdutoSelectorData,
    private produtosService: ProdutosService
  ) {}

  ngOnInit(): void {
    if (this.data?.initialTerm) {
      this.searchControl.setValue(this.data.initialTerm);
      this.search();
    } else {
      // Carrega os iniciais se não tiver termo
      this.search();
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.search();
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 100);
  }

  search(): void {
    const term = this.searchControl.value?.trim() || '';
    this.isLoading = true;
    this.produtosService.findAll(1, 30, term).subscribe({
      next: (res) => {
        this.produtos = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.produtos = [];
        this.isLoading = false;
      }
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchInput.nativeElement.focus();
  }

  selectProduto(produto: Produto): void {
    this.bottomSheetRef.dismiss(produto);
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }
}
