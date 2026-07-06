# ⚡ Nexa ERP - Showcase Demo

Este repositório contém a demonstração do **Nexa ERP**, um sistema de gestão comercial inteligente projetado para o segmento de varejo e materiais de construção. O foco principal deste projeto é demonstrar práticas modernas de arquitetura frontend, resiliência de rede e experiência de usuário de alta performance.


## 🚀 Destaques Arquiteturais & Funcionalidades

### 1. Arquitetura Reativa e State Management
* **Angular Signals:** Utilização de Signals para gerenciamento de estado local reativo, garantindo renderização ultra veloz e eliminação de change detection desnecessária.
* **Componentes Standalone:** Frontend modularizado sem acoplamento de módulos legados (NgModule).

### 2. Resiliência de Rede & Modo Offline-First
* **Sincronização com Dexie DB:** Integração com IndexedDB local para cacheamento de catálogo de produtos, clientes e armazenamento local de vendas pendentes no outbox.
* **Network Interceptors:** Mecanismo inteligente com RxJS (`shareReplay` e `firstValueFrom`) resolvendo condições de corrida e travamento concorrente durante a renovação automática de tokens (auth token refresh).
* **Robustez no Sync:** Tratamento de erros de validação da API (4xx) localmente para evitar loops infinitos de retentativas.

### 3. UI/UX Premium & Acessibilidade
* **Desacoplamento de Visualização:** Lógica de cupom térmico, orçamentos comerciais A4 e carnês de crediário isolados em um `PrintService` unificado com bypass de bloqueador de popups.
* **Nexa Select Component:** Adaptação dinâmica de inputs dropdown; no desktop comporta-se como `<mat-select>` e em mobile abre gavetas elegantes estilo *Bottom Sheet*.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend Framework:** Angular 21 (TypeScript)
* **CSS Framework:** Tailwind CSS & Angular Material
* **Local Database:** Dexie DB (IndexedDB wrapper)
* **Reactive Programming:** RxJS 7
* **Build Tool:** Angular CLI / Webpack
