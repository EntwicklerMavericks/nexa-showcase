import { NexaSelectComponent } from '../../../shared/components/nexa-select/nexa-select.component';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Produto } from '../services/produtos.service';
import { Categoria, CategoriasService } from '../../categorias/services/categorias.service';
import { FormDraftService } from '../../../shared/services/form-draft.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export interface ProdutoDialogData { produto?: Produto; }

@Component({
  selector: 'app-produto-dialog',
  standalone: true,
  imports: [NexaSelectComponent, CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatTabsModule, MatSnackBarModule],
  templateUrl: './produto-dialog.component.html',
  styles: [`
    .profit-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 6px 12px;
      height: 52px;
      border: 1px solid var(--nexa-border);
      border-radius: 4px;
      background: var(--nexa-surface-lighter);
      transition: all 0.3s ease;
      position: relative;
      margin-top: 4px;
      box-sizing: border-box;
      overflow: hidden;
    }
    
    .profit-card.high {
      border-color: rgba(34, 197, 94, 0.3);
      background: rgba(34, 197, 94, 0.04);
    }
    .profit-card.medium {
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.04);
    }
    .profit-card.low {
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.04);
    }

    .profit-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--nexa-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      margin-bottom: 2px;
      line-height: 1;
    }

    .profit-title mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .profit-card.high mat-icon { color: #22c55e; }
    .profit-card.medium mat-icon { color: #f59e0b; }
    .profit-card.low mat-icon { color: #ef4444; }

    .profit-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .profit-main {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .profit-percent {
      font-size: 16px;
      font-weight: 700;
      color: var(--nexa-text);
      line-height: 1;
    }
    .profit-card.high .profit-percent { color: #22c55e; }
    .profit-card.medium .profit-percent { color: #f59e0b; }
    .profit-card.low .profit-percent { color: #ef4444; }

    .profit-badge {
      font-size: 9px;
      padding: 2px 4px;
      border-radius: 4px;
      font-weight: 700;
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
      text-transform: uppercase;
    }
    .profit-badge.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .profit-badge.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .profit-details {
      font-size: 12px;
      color: var(--nexa-text-secondary);
      font-weight: 600;
      white-space: nowrap;
    }
  `]
})
export class ProdutoDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  categorias: Categoria[] = [];
  private destroy$ = new Subject<void>();
  private readonly DRAFT_KEY = 'produto-form-draft';
  private isEditMode = false;

  constructor(
    private fb: FormBuilder, 
    private dialogRef: MatDialogRef<ProdutoDialogComponent>,
    private categoriasService: CategoriasService, 
    private draftService: FormDraftService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: ProdutoDialogData
  ) {
    const p = data.produto;
    this.isEditMode = !!p;

    this.form = this.fb.group({
      nome: [p?.nome ?? '', [Validators.required]], 
      sku: [p?.sku ?? '', [Validators.required]],
      descricao: [p?.descricao ?? ''], 
      categoriaId: [p?.categoriaId ?? null, [Validators.required]],
      unidade: [p?.unidade ?? 'UN'], 
      codigoBarras: [p?.codigoBarras ?? ''],
      unidadeEstoque: [p?.unidadeEstoque ?? 'UN'],
      unidadeVenda: [p?.unidadeVenda ?? 'UN'],
      fatorConversao: [p?.fatorConversao ?? 1.0, [Validators.required, Validators.min(0.0001)]],
      precoCusto: [p?.precoCusto ?? 0, [Validators.required, Validators.min(0)]],
      precoVenda: [p?.precoVenda ?? 0, [Validators.required, Validators.min(0.01)]],
      ncm: [p?.ncm ?? ''], cfop: [p?.cfop ?? ''], cst: [p?.cst ?? ''],
      estoqueMinimo: [p?.estoqueMinimo ?? 0, [Validators.min(0)]],
    });
  }

  ngOnInit(): void { 
    this.categoriasService.findAll(1, 100).subscribe({ next: (res) => this.categorias = res.data }); 

    // Draft logic (Only for new products)
    if (!this.isEditMode) {
      if (this.draftService.hasDraft(this.DRAFT_KEY)) {
        const snackRef = this.snackBar.open('Rascunho não salvo encontrado.', 'Restaurar', { duration: 8000 });
        snackRef.onAction().subscribe(() => {
          const draft = this.draftService.getDraft(this.DRAFT_KEY);
          if (draft) this.form.patchValue(draft);
        });
      }

      this.form.valueChanges.pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      ).subscribe(value => {
        this.draftService.saveDraft(this.DRAFT_KEY, value);
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calcularMargem(): number { 
    const c = this.form.get('precoCusto')?.value || 0, v = this.form.get('precoVenda')?.value || 0; 
    return c <= 0 ? 0 : ((v - c) / c) * 100; 
  }

  calcularLucroReais(): number {
    const c = this.form.get('precoCusto')?.value || 0, v = this.form.get('precoVenda')?.value || 0;
    return v - c;
  }
  
  getMargemClass(): string { 
    const m = this.calcularMargem(); 
    return m >= 30 ? 'high' : m >= 15 ? 'medium' : 'low'; 
  }
  
  onSave(): void { 
    if (this.form.valid) {
      if (!this.isEditMode) {
        this.draftService.clearDraft(this.DRAFT_KEY);
      }
      this.dialogRef.close(this.form.value); 
    } 
  }
}
