import { Component, Input, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  ModalController,
} from '@ionic/angular/standalone';

import { Invoice, Order } from '../../models/order.model';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
  ],
  templateUrl: './invoice-modal.component.html',
  styleUrls: ['./invoice-modal.component.scss'],
})
export class InvoiceModalComponent implements OnInit {
  @Input() order!: Order;

  readonly IVA_RATE = 0.19;
  invoice!: Invoice;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    const subtotal = this.order.price * this.order.quantity;
    const iva = subtotal * this.IVA_RATE;
    this.invoice = { order: this.order, subtotal, iva, total: subtotal + iva };
  }

  close(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(): void {
    this.modalCtrl.dismiss(this.invoice, 'confirm');
  }
}
