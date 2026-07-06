import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NexaSelectComponent, NexaSelectOption } from './nexa-select.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NexaSelectComponent', () => {
  let component: NexaSelectComponent;
  let fixture: ComponentFixture<NexaSelectComponent>;
  
  // Mocks dos serviços do Angular Material / CDK
  let mockBottomSheet: jasmine.SpyObj<MatBottomSheet>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;
  
  // Subject para emitir mudanças de tela nos testes
  let breakpointSubject: Subject<BreakpointState>;

  const mockOptions: NexaSelectOption[] = [
    { label: 'Cimento CP-II', value: 'cimento' },
    { label: 'Argamassa AC-III', value: 'argamassa' },
    { label: 'Tubo PVC 25mm', value: 'tubo' }
  ];

  beforeEach(async () => {
    breakpointSubject = new Subject<BreakpointState>();
    mockBottomSheet = jasmine.createSpyObj('MatBottomSheet', ['open']);
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    
    // Simula a escuta do breakpoint retornando nosso Subject observable
    mockBreakpointObserver.observe.and.returnValue(breakpointSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        NexaSelectComponent,
        NoopAnimationsModule // Evita delay de animações nos testes
      ],
      providers: [
        { provide: MatBottomSheet, useValue: mockBottomSheet },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NexaSelectComponent);
    component = fixture.componentInstance;
    
    // Configura inputs padrão
    component.label = 'Produto';
    component.options = mockOptions;
    
    fixture.detectChanges();
  });

  afterEach(() => {
    breakpointSubject.complete();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar a label do campo', () => {
    const labelEl = fixture.debugElement.query(By.css('mat-label'));
    expect(labelEl).toBeTruthy();
    expect(labelEl.nativeElement.textContent).toContain('Produto');
  });

  // ─── Testes de Desktop ─────────────────────────────────────────────────────
  describe('Modo Desktop', () => {
    beforeEach(() => {
      // Simula que NÃO é uma tela mobile (Handset)
      breakpointSubject.next({ matches: false, breakpoints: {} });
      fixture.detectChanges();
    });

    it('deve utilizar o comportamento do mat-select de desktop', () => {
      expect(component.isMobile).toBeFalse();
      const selectEl = fixture.debugElement.query(By.css('mat-select'));
      expect(selectEl).toBeTruthy();
    });

    it('deve atualizar o valor e propagar a mudança de seleção no desktop', () => {
      spyOn(component, 'onChange');
      spyOn(component.selectionChange, 'emit');

      component.onDesktopSelectionChange('cimento');

      expect(component.value).toBe('cimento');
      expect(component.onChange).toHaveBeenCalledWith('cimento');
      expect(component.selectionChange.emit).toHaveBeenCalledWith({ value: 'cimento' });
    });
  });

  // ─── Testes de Mobile ──────────────────────────────────────────────────────
  describe('Modo Mobile', () => {
    beforeEach(() => {
      // Simula tela de dispositivo mobile (Handset matches: true)
      breakpointSubject.next({ matches: true, breakpoints: {} });
      fixture.detectChanges();
    });

    it('deve ativar a flag isMobile e ocultar o mat-select', () => {
      expect(component.isMobile).toBeTrue();
      const selectEl = fixture.debugElement.query(By.css('mat-select'));
      // No mobile, o mat-select fica oculto no template
      expect(selectEl).toBeNull();
    });

    it('deve chamar openMobileSelector ao clicar no campo', () => {
      spyOn(component, 'openMobileSelector').and.callFake(() => {});

      const formFieldEl = fixture.debugElement.query(By.css('mat-form-field'));
      formFieldEl.triggerEventHandler('click', null);

      expect(component.openMobileSelector).toHaveBeenCalled();
    });
  });

  // ─── Testes do ControlValueAccessor (Integração com Formulários) ───────────
  describe('ControlValueAccessor', () => {
    it('deve escrever o valor recebido pelo formulário (writeValue)', () => {
      component.writeValue('argamassa');
      expect(component.value).toBe('argamassa');
    });

    it('deve registrar as funções de callback onChange e onTouched', () => {
      const mockFn = () => {};
      component.registerOnChange(mockFn);
      component.registerOnTouched(mockFn);
      
      expect(component.onChange).toBe(mockFn);
      expect(component.onTouched).toBe(mockFn);
    });

    it('deve desabilitar o componente quando setDisabledState for chamado', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBeTrue();
    });
  });
});
