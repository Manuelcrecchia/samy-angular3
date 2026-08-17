import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';

interface GuidedDeadline {
  id: number;
  sourceFieldKey?: string | null;
  title: string;
  dueDate: string;
  remindDays?: number | null;
  plannedAppointmentId?: number | null;
  plannedFor?: string | null;
}

interface GuidedAsset {
  id: number;
  numeroCliente: string;
  customerLabel?: string;
  typeKey: string;
  code?: string;
  name?: string;
  location?: string;
  serialNumber?: string;
  customFields?: string | Record<string, any>;
  displayIdentifier?: string;
  deadlines?: GuidedDeadline[];
}

interface PreparationItem {
  assetId: number;
  fieldKeys: string[];
  deadlineIds: number[];
}

@Component({
  selector: 'app-customer-assets-guided-update',
  templateUrl: './customer-assets-guided-update.component.html',
  styleUrls: ['./customer-assets-guided-update.component.css'],
})
export class CustomerAssetsGuidedUpdateComponent implements OnInit {
  readonly preparationStorageKey = 'mvanager-customer-asset-intervention-preparation';
  assets: GuidedAsset[] = [];
  selectedCustomer = '';
  selectedPairs = new Set<string>();
  expandedAssetIds = new Set<number>();
  viewFilter: 'alerts' | 'all' = 'alerts';
  loading = true;
  error = '';

  constructor(
    private readonly http: HttpClient,
    public readonly global: GlobalService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly popup: PopupServiceService,
  ) {}

  get config(): any { return this.global.getTenantCustomerAssetsConfig(); }
  get types(): any[] { return this.config?.types || []; }

  get customers(): Array<{ id: string; label: string; count: number; expired: number; warning: number }> {
    const grouped = new Map<string, { id: string; label: string; count: number; expired: number; warning: number }>();
    for (const asset of this.assets) {
      const id = String(asset.numeroCliente);
      const current = grouped.get(id) || {
        id,
        label: asset.customerLabel || `Cliente ${id}`,
        count: 0,
        expired: 0,
        warning: 0,
      };
      current.count += 1;
      current.expired += this.assetDeadlineCount(asset, 'expired');
      current.warning += this.assetDeadlineCount(asset, 'warning');
      grouped.set(id, current);
    }
    return [...grouped.values()].sort((a, b) => {
      const severity = (b.expired - a.expired) || (b.warning - a.warning);
      return severity || a.label.localeCompare(b.label, 'it');
    });
  }

  get selectedCustomerInfo(): { id: string; label: string; count: number; expired: number; warning: number } | null {
    return this.customers.find((customer) => customer.id === this.selectedCustomer) || null;
  }

  get customerAssets(): GuidedAsset[] {
    return this.assets
      .filter((asset) => String(asset.numeroCliente) === this.selectedCustomer)
      .sort((a, b) => this.assetLabel(a).localeCompare(this.assetLabel(b), 'it', { numeric: true }));
  }

  get visibleCustomerAssets(): GuidedAsset[] {
    if (this.viewFilter === 'all') return this.customerAssets;
    return this.customerAssets.filter((asset) => this.assetAlertCount(asset) > 0);
  }

  get selectedAssetCount(): number {
    return new Set([...this.selectedPairs].map((pair) => pair.split(':')[0])).size;
  }

  get selectedDeadlineCount(): number {
    return this.preparationItems().reduce((total, item) => total + item.deadlineIds.length, 0);
  }

  ngOnInit(): void {
    Promise.resolve(this.global.loadTenantConfig()).finally(() => this.loadAssets());
  }

  loadAssets(): void {
    this.loading = true;
    this.http.get<GuidedAsset[]>(this.global.url + 'admin/deadlines/customer-assets/registry').subscribe({
      next: (assets) => {
        this.assets = (Array.isArray(assets) ? assets : [])
          .filter((asset) => !this.global.isAnonymizedRecord(asset));
        this.loading = false;
        this.applyRouteSelection();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'Impossibile caricare i presidi.';
      },
    });
  }

  guidedFields(typeKey: string): any[] {
    const type = this.types.find((item) => item.key === typeKey);
    return (type?.fields || []).map((field: any) => ({ ...field, scope: 'custom' }));
  }

  deadlineFields(typeKey: string): any[] {
    return this.guidedFields(typeKey).filter((field) => field.type === 'date' && field.isDeadline === true);
  }

  customerTypeGroups(): Array<{ typeKey: string; label: string; assets: GuidedAsset[]; fields: any[]; alerts: number }> {
    const grouped = new Map<string, GuidedAsset[]>();
    for (const asset of this.visibleCustomerAssets) {
      grouped.set(asset.typeKey, [...(grouped.get(asset.typeKey) || []), asset]);
    }
    return [...grouped.entries()].map(([typeKey, assets]) => ({
      typeKey,
      label: this.typeLabel(typeKey),
      assets,
      fields: this.guidedFields(typeKey),
      alerts: assets.reduce((total, asset) => total + this.assetAlertCount(asset), 0),
    }));
  }

  selectCustomer(customerId: string): void {
    this.selectedCustomer = String(customerId || '');
    this.selectedPairs = new Set();
    this.expandedAssetIds = new Set();
    this.viewFilter = 'alerts';
    if (this.selectedCustomer) this.selectAlertFields();
  }

  selectAlertFields(): void {
    const next = new Set<string>();
    for (const asset of this.customerAssets) {
      for (const deadline of asset.deadlines || []) {
        if (!['expired', 'warning'].includes(this.deadlineState(deadline))) continue;
        const field = this.fieldForDeadline(asset, deadline);
        if (field) next.add(this.pairKey(asset.id, field.key));
      }
    }
    this.selectedPairs = next;
  }

  toggleFilter(filter: 'alerts' | 'all'): void {
    this.viewFilter = filter;
  }

  pairKey(assetId: number, fieldKey: string): string { return `${assetId}:${fieldKey}`; }
  isPairSelected(asset: GuidedAsset, field: any): boolean { return this.selectedPairs.has(this.pairKey(asset.id, field.key)); }

  togglePair(event: Event, asset: GuidedAsset, field: any): void {
    event.preventDefault();
    event.stopPropagation();
    const next = new Set(this.selectedPairs);
    const key = this.pairKey(asset.id, field.key);
    next.has(key) ? next.delete(key) : next.add(key);
    this.selectedPairs = next;
  }

  isAssetSelected(asset: GuidedAsset): boolean {
    const fields = this.guidedFields(asset.typeKey);
    return fields.length > 0 && fields.every((field) => this.isPairSelected(asset, field));
  }

  isAssetPartial(asset: GuidedAsset): boolean {
    return !this.isAssetSelected(asset) && this.guidedFields(asset.typeKey).some((field) => this.isPairSelected(asset, field));
  }

  toggleAsset(event: Event, asset: GuidedAsset): void {
    event.preventDefault();
    event.stopPropagation();
    const select = !this.isAssetSelected(asset);
    const next = new Set(this.selectedPairs);
    for (const field of this.guidedFields(asset.typeKey)) {
      const key = this.pairKey(asset.id, field.key);
      select ? next.add(key) : next.delete(key);
    }
    this.selectedPairs = next;
  }

  toggleAssetDetails(assetId: number): void {
    const next = new Set(this.expandedAssetIds);
    next.has(assetId) ? next.delete(assetId) : next.add(assetId);
    this.expandedAssetIds = next;
  }

  isAssetExpanded(assetId: number): boolean { return this.expandedAssetIds.has(assetId); }

  toggleRule(event: Event, typeKey: string, field: any): void {
    event.preventDefault();
    event.stopPropagation();
    const assets = this.visibleCustomerAssets.filter((asset) => asset.typeKey === typeKey);
    const select = !assets.every((asset) => this.isPairSelected(asset, field));
    const next = new Set(this.selectedPairs);
    for (const asset of assets) {
      const key = this.pairKey(asset.id, field.key);
      select ? next.add(key) : next.delete(key);
    }
    this.selectedPairs = next;
  }

  isRuleSelected(typeKey: string, field: any): boolean {
    const assets = this.visibleCustomerAssets.filter((asset) => asset.typeKey === typeKey);
    return assets.length > 0 && assets.every((asset) => this.isPairSelected(asset, field));
  }

  async continueToCalendar(): Promise<void> {
    const items = this.preparationItems();
    if (!this.selectedCustomer || !items.length) {
      this.error = 'Seleziona almeno un presidio e un campo da aggiornare.';
      return;
    }
    const customer = this.selectedCustomerInfo;
    const selectedAssets = this.customerAssets.filter((asset) => items.some((item) => item.assetId === asset.id));
    const selectedLabels = selectedAssets.map((asset) => this.assetLabel(asset));
    const linkedDeadlines = selectedAssets.flatMap((asset) => (asset.deadlines || []).filter((deadline) =>
      items.some((item) => item.assetId === asset.id && item.deadlineIds.includes(Number(deadline.id))),
    ));
    const today = this.todayDateOnly();
    const futureDates = linkedDeadlines.map((deadline) => deadline.dueDate).filter((date) => date >= today).sort();
    sessionStorage.setItem(this.preparationStorageKey, JSON.stringify({
      version: 2,
      numeroCliente: this.selectedCustomer,
      customerLabel: customer?.label || this.selectedCustomer,
      mode: 'guided',
      items,
      createdAt: new Date().toISOString(),
    }));
    const title = `${this.selectedCustomer} - Intervento guidato presidi`.slice(0, 240);
    const description = [
      `Intervento guidato su ${items.length} presidi e ${this.selectedPairs.size} campi.`,
      `Presidi: ${selectedLabels.join(', ')}`,
      linkedDeadlines.length ? `Scadenze collegate: ${linkedDeadlines.map((item) => item.title).join(', ')}` : '',
    ].filter(Boolean).join('\n').slice(0, 4000);
    await this.router.navigate([this.responsiveAdminPath('calendarHome')], {
      queryParams: {
        assetPreparation: '1',
        deadlineIds: linkedDeadlines.map((deadline) => deadline.id).join(','),
        deadlineCategory: 'deadline_customer_asset',
        planTitle: title,
        planDescription: description,
        planDate: futureDates[0] || today,
        interventionMode: 'guided',
      },
    });
  }

  async cancelGuidedUpdate(): Promise<void> {
    if (this.selectedPairs.size && !await this.popup.confirm(
      'Vuoi annullare la preparazione? La selezione dei presidi verrà eliminata.',
      'Annullare la preparazione?',
      { type: 'error', confirmLabel: 'Elimina selezione' },
    )) return;
    sessionStorage.removeItem(this.preparationStorageKey);
    await this.router.navigateByUrl(this.responsiveAdminPath('customer-asset-deadlines'));
  }

  typeLabel(typeKey: string): string { return this.types.find((item) => item.key === typeKey)?.label || typeKey; }
  assetDisplayLabel(asset: GuidedAsset): string { return `${this.assetLabel(asset)} · ${this.typeLabel(asset.typeKey)}`; }
  trackCustomer(_index: number, customer: { id: string }): string { return customer.id; }
  trackTypeGroup(_index: number, group: { typeKey: string }): string { return group.typeKey; }
  trackAsset(_index: number, asset: GuidedAsset): number { return asset.id; }
  trackField(_index: number, field: any): string { return String(field.key); }

  assetAlertCount(asset: GuidedAsset): number {
    return (asset.deadlines || []).filter((deadline) => ['expired', 'warning'].includes(this.deadlineState(deadline))).length;
  }

  assetDeadlineCount(asset: GuidedAsset, state: 'expired' | 'warning'): number {
    return (asset.deadlines || []).filter((deadline) => this.deadlineState(deadline) === state).length;
  }

  deadlineForField(asset: GuidedAsset, field: any): GuidedDeadline | null {
    return (asset.deadlines || []).find((deadline) => deadline.sourceFieldKey === field.key)
      || (asset.deadlines || []).find((deadline) => !deadline.sourceFieldKey && deadline.title === field.label)
      || null;
  }

  fieldDeadlineState(asset: GuidedAsset, field: any): 'expired' | 'warning' | 'regular' | 'none' {
    const deadline = this.deadlineForField(asset, field);
    return deadline ? this.deadlineState(deadline) : 'none';
  }

  currentValue(asset: GuidedAsset, field: any): string {
    if (field.type === 'attachment') {
      const count = ((asset as any).attachments || []).filter((item: any) => item.fieldKey === field.key).length;
      return count ? `${count} ${count === 1 ? 'allegato' : 'allegati'}` : 'Nessun allegato';
    }
    const value = this.parseCustomFields(asset.customFields)[field.key];
    if (field.type === 'boolean') return value === true ? 'Sì' : 'No';
    return value === null || value === undefined || value === '' ? 'Non indicato' : String(value);
  }

  private deadlineState(deadline: GuidedDeadline): 'expired' | 'warning' | 'regular' {
    const due = String(deadline?.dueDate || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return 'regular';
    const today = this.todayDateOnly();
    if (due < today) return 'expired';
    const warningDate = this.addDays(today, Math.max(0, Number(deadline.remindDays) || 0));
    return due <= warningDate ? 'warning' : 'regular';
  }

  private fieldForDeadline(asset: GuidedAsset, deadline: GuidedDeadline): any | null {
    return this.guidedFields(asset.typeKey).find((field) => field.key === deadline.sourceFieldKey)
      || this.guidedFields(asset.typeKey).find((field) => field.label === deadline.title)
      || null;
  }

  private preparationItems(): PreparationItem[] {
    return this.customerAssets.map((asset) => {
      const fieldKeys = this.guidedFields(asset.typeKey)
        .filter((field) => this.isPairSelected(asset, field))
        .map((field) => String(field.key));
      const selected = new Set(fieldKeys);
      const deadlineIds = (asset.deadlines || [])
        .filter((deadline) => {
          const field = this.fieldForDeadline(asset, deadline);
          return field && selected.has(String(field.key));
        })
        .map((deadline) => Number(deadline.id));
      return { assetId: asset.id, fieldKeys, deadlineIds };
    }).filter((item) => item.fieldKeys.length > 0);
  }

  private applyRouteSelection(): void {
    const customerId = String(this.route.snapshot.queryParamMap.get('customerId') || '');
    const requestedDeadlineIds = new Set(String(this.route.snapshot.queryParamMap.get('deadlineIds') || '')
      .split(',').map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0));
    if (!customerId && !requestedDeadlineIds.size) return;
    const requestedAsset = this.assets.find((asset) => (asset.deadlines || []).some((deadline) => requestedDeadlineIds.has(Number(deadline.id))));
    this.selectCustomer(customerId || String(requestedAsset?.numeroCliente || ''));
    if (!requestedDeadlineIds.size) return;
    const next = new Set(this.selectedPairs);
    for (const asset of this.customerAssets) {
      for (const deadline of asset.deadlines || []) {
        if (!requestedDeadlineIds.has(Number(deadline.id))) continue;
        const field = this.fieldForDeadline(asset, deadline);
        if (field) next.add(this.pairKey(asset.id, field.key));
        this.expandedAssetIds.add(asset.id);
      }
    }
    this.selectedPairs = next;
    this.viewFilter = 'all';
  }

  private assetLabel(asset: GuidedAsset): string {
    return asset.displayIdentifier || asset.code || `PR-${String(asset.id).padStart(6, '0')}`;
  }

  private parseCustomFields(value: GuidedAsset['customFields']): Record<string, any> {
    if (value && typeof value === 'object') return value;
    try { return JSON.parse(String(value || '{}')); } catch { return {}; }
  }

  private todayDateOnly(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private addDays(value: string, days: number): string {
    const [year, month, day] = value.split('-').map(Number);
    const result = new Date(Date.UTC(year, month - 1, day + days));
    return result.toISOString().slice(0, 10);
  }

  private responsiveAdminPath(path: string): string {
    const normalized = String(path || '').replace(/^\/+/, '');
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 992px)').matches
      ? `/homeAdmin/${normalized}`
      : `/${normalized}`;
  }
}
