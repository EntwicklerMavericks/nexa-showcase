import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface ImportarDialogData {
  type: 'produtos' | 'clientes';
  title: string;
  apiUrl: string;
}

interface ImportError {
  line: number;
  error: string;
}

interface ImportResponse {
  total: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

@Component({
  selector: 'app-importar-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">upload_file</mat-icon>
      Importar {{ data.title }} via CSV
    </h2>

    <mat-dialog-content class="import-dialog-content">
      <div class="import-instructions">
        <p>
          Utilize esta ferramenta para cadastrar seus registros em lote de forma rápida.
          Você pode baixar o arquivo modelo CSV abaixo para preencher as colunas corretamente.
        </p>
        <button mat-stroked-button color="primary" (click)="downloadTemplate()" type="button" class="template-btn">
          <mat-icon>download</mat-icon> Baixar Modelo CSV
        </button>
      </div>

      <!-- Zona de Upload de Arquivo -->
      @if (!uploading() && !results()) {
        <div class="dropzone" 
             [class.dragover]="isDragOver()"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave()"
             (drop)="onDrop($event)"
             (click)="fileInput.click()">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <p class="main-text">Arraste e solte o arquivo CSV aqui ou clique para selecionar</p>
          <p class="sub-text">Apenas arquivos .csv são suportados</p>
          @if (selectedFile()) {
            <div class="selected-file-badge">
              <mat-icon>insert_drive_file</mat-icon>
              <span>{{ selectedFile()?.name }}</span>
            </div>
          }
        </div>
        <input type="file" #fileInput (change)="onFileSelected($event)" accept=".csv" style="display: none;" />
      }

      <!-- Barra de Progresso do Upload -->
      @if (uploading()) {
        <div class="uploading-state">
          <mat-icon class="pulse-upload">sync</mat-icon>
          <p>Enviando e processando arquivo... ({{ progress() }}%)</p>
          <mat-progress-bar mode="determinate" [value]="progress()" color="primary"></mat-progress-bar>
        </div>
      }

      <!-- Relatório de Resultados pós-upload -->
      @if (results()) {
        <div class="results-container">
          <div class="results-summary">
            <div class="summary-card success">
              <mat-icon>check_circle</mat-icon>
              <span class="count">{{ results()?.successCount }}</span>
              <span class="label">Importados</span>
            </div>
            <div class="summary-card errors">
              <mat-icon>error</mat-icon>
              <span class="count">{{ results()?.errorCount }}</span>
              <span class="label">Falhas</span>
            </div>
            <div class="summary-card total">
              <mat-icon>list_alt</mat-icon>
              <span class="count">{{ results()?.total }}</span>
              <span class="label">Total Processado</span>
            </div>
          </div>

          @if (results()!.errors.length > 0) {
            <div class="errors-log-container">
              <h4>Detalhamento das Inconsistências de Linha</h4>
              <div class="errors-list">
                @for (err of results()!.errors; track $index) {
                  <div class="error-item">
                    <span class="line-number">Linha {{ err.line }}:</span>
                    <span class="error-msg">{{ err.error }}</span>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="success-message">
              <mat-icon>sentiment_very_satisfied</mat-icon>
              <p>Parabéns! Todos os registros foram importados e validados com 100% de sucesso.</p>
            </div>
          }
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions-footer">
      <button mat-button mat-dialog-close [disabled]="uploading()">Fechar</button>
      @if (selectedFile() && !uploading() && !results()) {
        <button mat-flat-button color="primary" (click)="uploadFile()" style="padding: 0 24px;">
          <mat-icon>rocket_launch</mat-icon> Processar Importação
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .import-dialog-content {
      padding: 20px 24px !important;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .import-instructions {
      background: var(--nexa-surface-light);
      border: 1px solid var(--nexa-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    .import-instructions p {
      margin: 0;
      line-height: 1.5;
      font-size: 13.5px;
      color: var(--nexa-text-secondary);
    }
    .template-btn {
      height: 36px;
      padding: 0 16px;
      font-size: 13px;
      font-weight: 500;
    }
    .dropzone {
      border: 2px dashed rgba(249, 115, 22, 0.3);
      background: rgba(249, 115, 22, 0.02);
      border-radius: 16px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transition: all 0.25s ease;
    }
    .dropzone:hover, .dropzone.dragover {
      border-color: #f97316;
      background: rgba(249, 115, 22, 0.06);
      box-shadow: 0 0 15px rgba(249, 115, 22, 0.15);
    }
    .upload-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #f97316;
      margin-bottom: 8px;
    }
    .main-text {
      margin: 0;
      font-weight: 600;
      font-size: 15px;
      color: var(--nexa-text);
    }
    .sub-text {
      margin: 0;
      font-size: 12px;
      color: var(--nexa-text-muted);
    }
    .selected-file-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(249, 115, 22, 0.15);
      border: 1px solid rgba(249, 115, 22, 0.3);
      color: #f97316;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 12px;
    }
    .uploading-state {
      padding: 30px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }
    .pulse-upload {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #f97316;
      animation: rotate 1.5s linear infinite;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .results-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .results-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .summary-card {
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .summary-card mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      margin-bottom: 4px;
    }
    .summary-card .count {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.1;
    }
    .summary-card .label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      opacity: 0.75;
    }
    .summary-card.success {
      background: rgba(34, 197, 94, 0.05);
      border-color: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    .summary-card.errors {
      background: rgba(239, 68, 68, 0.05);
      border-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .summary-card.total {
      background: var(--nexa-surface-light);
      color: var(--nexa-text);
    }
    .errors-log-container {
      background: rgba(239, 68, 68, 0.02);
      border: 1px solid rgba(239, 68, 68, 0.15);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .errors-log-container h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #ef4444;
    }
    .errors-list {
      max-height: 180px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-right: 8px;
    }
    .errors-list::-webkit-scrollbar {
      width: 6px;
    }
    .errors-list::-webkit-scrollbar-thumb {
      background: rgba(259, 259, 259, 0.1);
      border-radius: 3px;
    }
    .error-item {
      display: flex;
      gap: 8px;
      font-size: 12.5px;
      font-family: monospace;
      line-height: 1.4;
      background: rgba(0, 0, 0, 0.15);
      padding: 6px 10px;
      border-radius: 6px;
      border-left: 3px solid #ef4444;
    }
    .error-item .line-number {
      font-weight: bold;
      color: #ef4444;
      white-space: nowrap;
    }
    .error-item .error-msg {
      color: var(--nexa-text-secondary);
    }
    .success-message {
      text-align: center;
      padding: 30px 20px;
      background: rgba(34, 197, 94, 0.05);
      border: 1px solid rgba(34, 197, 94, 0.15);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .success-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #22c55e;
    }
    .success-message p {
      margin: 0;
      font-weight: 600;
      font-size: 14px;
      color: #22c55e;
    }
  `]
})
export class ImportarDialogComponent {
  selectedFile = signal<File | null>(null);
  isDragOver = signal(false);
  uploading = signal(false);
  progress = signal(0);
  results = signal<ImportResponse | null>(null);
  hasImportedAny = false;

  constructor(
    private readonly http: HttpClient,
    private readonly snackBar: MatSnackBar,
    private readonly dialogRef: MatDialogRef<ImportarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ImportarDialogData,
  ) {}

  downloadTemplate(): void {
    const csvContent = this.data.type === 'produtos'
      ? 'nome;sku;precoCusto;precoVenda;categoria;codigoBarras;descricao;unidade;estoqueMinimo;estoqueAtual\r\nCimento Votoran CP-II 50kg;CIM-001;32.50;42.00;Alvenaria;7891234567890;Cimento cinza de secagem rápida;Saco;10;50'
      : 'nome;cpfCnpj;tipo;email;telefone;endereco;cidade;estado;cep;ie;observacoes\r\nJoão da Silva;12345678909;PF;joao@email.com;11999999999;Rua do Comércio, 123;São Paulo;SP;01001000;;Cliente VIP';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `modelo_importacao_${this.data.type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        this.selectedFile.set(file);
      } else {
        this.snackBar.open('Formato inválido! Por favor selecione um arquivo CSV.', 'Fechar', { duration: 3000 });
      }
    }
  }

  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.progress.set(0);

    const formData = new FormData();
    formData.append('file', file);

    this.http.post<any>(this.data.apiUrl, formData, {
      reportProgress: true,
      observe: 'events',
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
          this.progress.set(percentDone);
        } else if (event instanceof HttpResponse) {
          this.uploading.set(false);
          const response = event.body?.data || event.body;
          this.results.set(response);
          if (response.successCount > 0) {
            this.hasImportedAny = true;
            this.snackBar.open(`Importação concluída: ${response.successCount} inseridos com sucesso!`, 'OK', { duration: 4000 });
          } else {
            this.snackBar.open('Nenhum registro foi importado. Verifique os erros.', 'Fechar', { duration: 4000 });
          }
        }
      },
      error: (err) => {
        this.uploading.set(false);
        this.snackBar.open(err.error?.message || 'Erro ao processar arquivo.', 'Fechar', { duration: 4000 });
      },
    });

    // Ao fechar, se tiver importado pelo menos um registro, a gente avisa ao parent
    this.dialogRef.beforeClosed().subscribe(() => {
      if (this.hasImportedAny) {
        this.dialogRef.close(true);
      }
    });
  }
}
