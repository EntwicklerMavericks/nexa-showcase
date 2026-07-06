/**
 * Contrato de resposta paginada da API Nexa.
 * Use como tipo de retorno em todos os services que listam recursos.
 *
 * @example
 *   findAll(): Observable<PaginatedResponse<Produto>> { ... }
 */
export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
