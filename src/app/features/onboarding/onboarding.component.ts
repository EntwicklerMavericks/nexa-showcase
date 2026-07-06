import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NgxMaskDirective } from 'ngx-mask';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ErrorStateMatcher } from '@angular/material/core';

export class ImmediateErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NgxMaskDirective,
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  selectedPlan = signal<'MEI' | 'STARTER' | 'PRO' | 'PREMIUM'>('STARTER');
  isSubmitting = signal(false);
  immediateMatcher = new ImmediateErrorStateMatcher();

  userFormGroup: FormGroup = this.fb.group({
    userName: ['', Validators.required],
    userEmail: ['', [Validators.required, Validators.email], [this.emailAsyncValidator()]],
    userSenha: ['', [Validators.required, Validators.minLength(6)]],
  });

  companyFormGroup: FormGroup = this.fb.group({
    empresaRazaoSocial: ['', Validators.required],
    empresaNomeFantasia: [''],
    empresaCnpj: ['', [Validators.required, Validators.minLength(14)]],
  });

  emailAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return timer(500).pipe(
        switchMap(() => this.authService.checkEmail(control.value)),
        map(res => (res.exists ? { emailTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const plan = params['plan']?.toUpperCase();
      if (['MEI', 'STARTER', 'PRO', 'PREMIUM'].includes(plan)) {
        this.selectedPlan.set(plan);
      }
    });
  }

  getPlanPrice(): string {
    const prices: Record<string, string> = {
      'MEI': 'R$ 67',
      'STARTER': 'R$ 127',
      'PRO': 'R$ 297',
      'PREMIUM': 'R$ 599'
    };
    return prices[this.selectedPlan()] || 'R$ 0,00';
  }

  goBack(): void {
    window.location.href = 'https://nexa-frontend-landing.eduardotheodorofegit.workers.dev/#pricing';
  }

  submitRegistration() {
    if (this.userFormGroup.invalid || this.companyFormGroup.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      ...this.userFormGroup.value,
      ...this.companyFormGroup.value,
      plano: this.selectedPlan()
    };

    this.authService.registerTenant(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.snackBar.open('Conta criada com sucesso! Bem-vindo ao Nexa.', 'OK', { duration: 5000 });
        if (this.selectedPlan() === 'MEI') {
          this.router.navigate(['/vendas']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.snackBar.open(err.error?.message || 'Erro ao criar conta', 'Fechar', { duration: 5000 });
      }
    });
  }
}
