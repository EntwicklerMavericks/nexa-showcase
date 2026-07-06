import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LogisticaService, Carga } from '../services/logistica.service';

export interface RomaneioDialogData {
  cargaId: number;
}

@Component({
  selector: 'app-romaneio-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './romaneio-dialog.component.html',
  styleUrl: './romaneio-dialog.component.scss'
})
export class RomaneioDialogComponent implements OnInit {
  loading = signal(true);
  carga = signal<Carga | null>(null);

  constructor(
    private logisticaService: LogisticaService,
    private dialogRef: MatDialogRef<RomaneioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RomaneioDialogData
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading.set(true);
    this.logisticaService.obterDetalhesCarga(this.data.cargaId).subscribe({
      next: (res) => {
        this.carga.set(res.data || res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.dialogRef.close();
      }
    });
  }

  onImprimir(): void {
    window.print();
  }
}
