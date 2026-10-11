import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Icônes « trait » 24×24 (style Lucide) — une seule source pour tous les espaces. */
const ICONS = {
  home: 'M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.3-4.3',
  ticket: 'M3 9a2 2 0 0 0 0 6v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a2 2 0 0 1 0-6V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z M13 5v14',
  wallet: 'M20 7H5a2 2 0 0 1 0-4h13v4 M3 5v14a2 2 0 0 0 2 2h15V7 M16 14h.01',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0',
  star: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  flag: 'M4 22V4 M4 4h13l-2 4 2 4H4',
  headset: 'M3 14v-2a9 9 0 0 1 18 0v2 M21 15a2 2 0 0 1-2 2h-1v-5h3z M3 15a2 2 0 0 0 2 2h1v-5H3z M18 17v1a3 3 0 0 1-3 3h-3',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21a7 7 0 0 1 14 0 M16 3.1a4 4 0 0 1 0 7.8 M22 21a7 7 0 0 0-4-6.3',
  car: 'M5 17H3v-5l2-5h14l2 5v5h-2 M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M9 17h6 M3 12h18',
  route: 'M12 5h3.5a3.5 3.5 0 0 1 0 7h-7a3.5 3.5 0 0 0 0 7H12',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  card: 'M3 6h18v12H3z M3 10h18',
  pin: 'M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clipboard: 'M9 3h6v3H9z M8 5H6a1 1 0 0 0-1 1v15h14V6a1 1 0 0 0-1-1h-2 M9 12h6 M9 16h6',
  logout: 'M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4 M16 17l5-5-5-5 M21 12H9',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  chart: 'M3 3v18h18 M7 15l4-5 3 3 5-7',
  message: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  back: 'M19 12H5 M11 6l-6 6 6 6',
  plus: 'M12 5v14 M5 12h14',
  alert: 'M12 3 2 20h20z M12 10v4 M12 17h.01',
  scale: 'M12 3v18 M5 21h14 M6 7h12 M6 7l-3 7a3 3 0 0 0 6 0z M18 7l-3 7a3 3 0 0 0 6 0z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  seat: 'M7 3h4a2 2 0 0 1 2 2v7H7z M5 12h12a2 2 0 0 1 2 2v4H5z M7 18v3 M17 18v3',
  external: 'M14 4h6v6 M20 4l-9 9 M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  id: 'M3 5h18v14H3z M8 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M14 10h4 M14 14h4 M6 17c.5-1.5 3.5-1.5 4 0',
  key: 'M15 8a4 4 0 1 1-3.5 5.9L3 22v-3l2-2v-2h2l1.8-1.8A4 4 0 0 1 15 8z',
} as const;

export type IconName = keyof typeof ICONS;

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: [`
    :host { display: inline-flex; width: 1.25em; height: 1.25em; flex-shrink: 0; }
    svg { width: 100%; height: 100%; }
  `],
})
export class IconComponent {
  readonly name = input.required<IconName>();
  protected readonly path = computed(() => ICONS[this.name()]);
}
