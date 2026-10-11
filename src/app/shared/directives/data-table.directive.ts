import {
  Directive,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
} from '@angular/core';
import DataTable from 'datatables.net';
import type { Api, Config, ConfigColumns } from 'datatables.net';

/**
 * DataTables enhancement for Angular-rendered native tables.
 *
 * Angular remains the owner of the rows and cells. We capture each cell's
 * real DOM nodes inside a stable wrapper and tell DataTables to return that
 * same DOM node for display. This preserves Angular bindings, @if/@for,
 * routerLink and click handlers while DataTables handles search and sorting.
 */
@Directive({
  selector: 'table[appDataTable]',
  standalone: true,
})
export class DataTableDirective {
  private readonly host = inject<ElementRef<HTMLTableElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private table?: Api;
  private readonly cellHosts: HTMLElement[][] = [];
  private destroyed = false;

  constructor() {
    afterNextRender(() => this.initialize());

    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.destroy();
    });
  }

  private initialize(): void {
    if (this.destroyed) {
      return;
    }

    const element = this.host.nativeElement;
    const columnCount = this.captureAngularCells(element);

    if (columnCount === 0) {
      return;
    }

    const columns: ConfigColumns[] = Array.from(
      { length: columnCount },
      (_, columnIndex) => ({
        render: (
          data: unknown,
          type: string,
          _row: unknown,
          meta: { row: number; col: number },
        ) => {
          if (type === 'display') {
            return this.cellHosts[meta.row]?.[columnIndex] ?? '';
          }

          // DataTables uses this value for search/order/type detection.
          return this.toSearchableValue(data);
        },
      }),
    );

    const options: Config = {
      columns,

      searching: true,
      ordering: true,

      // Pagination is already handled by <app-pagination> and the API.
      // Keeping a second client-side paginator would be incorrect.
      paging: false,
      info: false,
      lengthChange: false,

      language: {
        search: 'Rechercher :',
        zeroRecords: 'Aucun résultat',
        emptyTable: 'Aucune donnée disponible',
      },
    };

    try {
      this.table = this.zone.runOutsideAngular(
        () => new DataTable(element, options),
      );
    } catch (error) {
      console.error(
        '[appDataTable] Impossible d’initialiser DataTables.',
        error,
      );
    }
  }

  /**
   * Wrap each Angular cell content in a stable DOM element.
   *
   * DataTables 2 supports returning DOM nodes from columns.render for the
   * display type. Returning the original node is what prevents Angular's
   * template output from being converted to literal HTML text.
   */
  private captureAngularCells(element: HTMLTableElement): number {
    this.cellHosts.length = 0;

    const rows = Array.from(element.tBodies[0]?.rows ?? []);

    for (const row of rows) {
      const rowHosts: HTMLElement[] = [];

      for (const cell of Array.from(row.cells)) {
        const host = document.createElement('span');

        // Do not introduce a visual/layout wrapper.
        host.style.display = 'contents';
        host.setAttribute('data-angular-cell-host', '');

        while (cell.firstChild) {
          host.appendChild(cell.firstChild);
        }

        cell.appendChild(host);
        rowHosts.push(host);
      }

      this.cellHosts.push(rowHosts);
    }

    return this.cellHosts[0]?.length ?? 0;
  }

  private toSearchableValue(value: unknown): string | number {
    if (value == null) {
      return '';
    }

    if (typeof value === 'number') {
      return value;
    }

    return String(value);
  }

  private destroy(): void {
    if (!this.table) {
      return;
    }

    try {
      this.zone.runOutsideAngular(() => {
        this.table?.destroy();
      });
    } catch (error) {
      console.warn('[appDataTable] Nettoyage DataTables échoué.', error);
    } finally {
      this.table = undefined;
    }
  }
}
