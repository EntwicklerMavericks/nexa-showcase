import { NexaSelectComponent } from '../../shared/components/nexa-select/nexa-select.component';
import { Component, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmpresasService, Empresa } from '../empresas/services/empresas.service';
import { ProdutosService } from '../produtos/services/produtos.service';
import { FornecedoresService } from '../fornecedores/services/fornecedores.service';
import { CategoriasService, Categoria } from '../categorias/services/categorias.service';
import { AuthService } from '../../core/auth/auth.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-onboarding-wizard',
  standalone: true,
  imports: [NexaSelectComponent, 
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    NgxMaskDirective
  ],
  templateUrl: './onboarding-wizard.component.html',
  styleUrl: './onboarding-wizard.component.scss'
})
export class OnboardingWizardComponent implements OnInit {
  @Output() onComplete = new EventEmitter<void>();

  readonly step = signal(1);
  readonly loading = signal(false);
  readonly loadingImport = signal(false);
  readonly importSuccess = signal(false);
  readonly importedCount = signal(0);
  
  // Scoped lists
  readonly importedCategoriasList = signal<Categoria[]>([]);

  // Pre-filled Demo states
  readonly empresaForm = signal({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    ie: '',
    logo: ''
  });

  readonly firstProduct = signal({
    nome: 'Cimento CP-II F-32 50kg',
    precoCusto: 24.50,
    precoVenda: 39.90,
    sku: 'CIM-CP2-VOTORAN',
    codigoBarras: '7891234000025',
    categoriaId: 0
  });

  readonly firstFornecedor = signal({
    nome: 'Votorantim Cimentos S.A.',
    cpfCnpj: '33.789.444/0001-23',
    tipo: 'PJ'
  });

  readonly progressPercent = computed(() => {
    return (this.step() / 3) * 100;
  });

  constructor(
    private readonly empresasService: EmpresasService,
    private readonly produtosService: ProdutosService,
    private readonly fornecedoresService: FornecedoresService,
    private readonly categoriasService: CategoriasService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmpresaData();
  }

  loadEmpresaData(): void {
    const user = this.authService.currentUser();
    if (!user || !user.empresaId) return;

    this.loading.set(true);
    this.empresasService.findOne(user.empresaId).subscribe({
      next: (res: any) => {
        // Safe check for unwrapped response
        const emp = res.id ? res : res.data;
        if (emp) {
          this.empresaForm.set({
            razaoSocial: emp.razaoSocial || '',
            nomeFantasia: emp.nomeFantasia || '',
            cnpj: emp.cnpj || '',
            ie: emp.ie || '',
            logo: emp.logo || ''
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onLogoError(event: any): void {
    this.snackBar.open('Formato de logo inválido ou quebrado', 'Fechar', { duration: 3000 });
  }

  saveEmpresaStep(): void {
    const user = this.authService.currentUser();
    if (!user || !user.empresaId) return;

    this.loading.set(true);
    this.empresasService.update(user.empresaId, this.empresaForm()).subscribe({
      next: () => {
        this.loading.set(false);
        this.empresasService.activeLogo.set(this.empresaForm().logo || null);
        this.snackBar.open('Dados da empresa salvos com sucesso!', 'OK', { duration: 3000 });
        this.step.set(2);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Erro ao salvar dados da empresa', 'Fechar', { duration: 3000 });
      }
    });
  }

  importarCategorias(): void {
    this.loadingImport.set(true);
    this.empresasService.importarCategoriasConstrucao().subscribe({
      next: (res) => {
        // Unwrapped check
        const total = res.total !== undefined ? res.total : res.data?.total;
        this.importedCount.set(total || 8);
        this.importSuccess.set(true);
        this.loadingImport.set(false);
        this.snackBar.open('Categorias padrão de material de construção criadas com sucesso!', 'Show!', { duration: 4000 });
        
        // Load the list of newly created categories to select in Step 3
        this.categoriasService.findAll(1, 100).subscribe({
          next: (catRes: any) => {
            const list = catRes.data || catRes;
            this.importedCategoriasList.set(list || []);
            // Set default category to the first one
            if (list && list.length > 0) {
              this.firstProduct.update(p => ({ ...p, categoriaId: list[0].id }));
            }
          }
        });
      },
      error: (err) => {
        this.loadingImport.set(false);
        this.snackBar.open(err.error?.message || 'Erro ao importar categorias', 'Fechar', { duration: 4000 });
      }
    });
  }

  saveOnboarding(): void {
    this.loading.set(true);

    // 1. Create Supplier
    this.fornecedoresService.create(this.firstFornecedor()).subscribe({
      next: () => {
        // 2. Create Product
        this.produtosService.create(this.firstProduct()).subscribe({
          next: () => {
            this.loading.set(false);
            this.snackBar.open('Setup finalizado com sucesso! Seu ERP está pronto.', 'Eba!', { duration: 5000 });
            this.onComplete.emit();
          },
          error: (err) => {
            this.loading.set(false);
            this.snackBar.open(err.error?.message || 'Erro ao cadastrar produto de onboarding', 'Fechar', { duration: 4000 });
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Erro ao cadastrar fornecedor de onboarding', 'Fechar', { duration: 4000 });
      }
    });
  }
}
