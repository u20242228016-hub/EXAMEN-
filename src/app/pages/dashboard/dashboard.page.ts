import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonList,
  IonAvatar,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonText,
  ModalController,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';

import { Order, SortMode, StockFilter } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { InvoiceModalComponent } from '../../components/invoice-modal/invoice-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSearchbar,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonList,
    IonAvatar,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonText,
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  readonly STOCK_CRITICO = 5;

  /** Datos originales: nunca se modifican, permiten limpiar filtros. */
  private allOrders: Order[] = [];

  orders: Order[] = [];
  loading = true;
  error = '';

  searchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  stockFilter: StockFilter = 'all';
  sortMode: SortMode = 'default';

  totalValue = 0;
  criticalCount = 0;

  constructor(
    private orderService: OrderService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.allOrders = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las órdenes. Verifica tu conexión.';
        this.loading = false;
      },
    });
  }

  /** Reglas de negocio: filter() + sort() + reduce() sobre la copia de datos. */
  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const min = this.minPrice ?? 0;
    const max = this.maxPrice ?? Number.MAX_SAFE_INTEGER;

    let result = this.allOrders.filter((o) => {
      const matchText =
        !term ||
        o.title.toLowerCase().includes(term) ||
        o.category.toLowerCase().includes(term) ||
        String(o.id).includes(term);
      const matchPrice = o.price >= min && o.price <= max;
      const matchStock =
        this.stockFilter === 'all' ||
        (this.stockFilter === 'critical' && this.isCritical(o)) ||
        (this.stockFilter === 'ok' && !this.isCritical(o));
      return matchText && matchPrice && matchStock;
    });

    if (this.sortMode === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (this.sortMode === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    this.orders = result;
    this.totalValue = result.reduce((sum, o) => sum + o.price * o.quantity, 0);
    this.criticalCount = result.filter((o) => this.isCritical(o)).length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.stockFilter = 'all';
    this.sortMode = 'default';
    this.applyFilters();
  }

  isCritical(order: Order): boolean {
    return order.stock < this.STOCK_CRITICO;
  }

  badgeColor(order: Order): string {
    return this.isCritical(order) ? 'danger' : 'success';
  }

  async openInvoice(order: Order): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: InvoiceModalComponent,
      componentProps: { order },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'confirm') {
      await this.showToast(`Factura de la orden #${order.id} generada`);
    }
  }

  async showCriticalAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Stock crítico',
      message: `Hay ${this.criticalCount} orden(es) con stock menor a ${this.STOCK_CRITICO} unidades.`,
      buttons: [
        { text: 'Cerrar', role: 'cancel' },
        {
          text: 'Ver solo críticas',
          handler: () => {
            this.stockFilter = 'critical';
            this.applyFilters();
          },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  trackById(_: number, order: Order): number {
    return order.id;
  }
}
