import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Order, PostDto } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';
  private readonly categories = [
    'Tecnología',
    'Hogar',
    'Oficina',
    'Deportes',
    'Moda',
    'Salud',
    'Juguetes',
    'Libros',
    'Mascotas',
    'Herramientas',
  ];

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http
      .get<PostDto[]>(this.apiUrl)
      .pipe(map((posts) => posts.map((p) => this.toOrder(p))));
  }

  /** Completa localmente precio, cantidad y stock (el endpoint solo trae posts). */
  private toOrder(post: PostDto): Order {
    return {
      id: post.id,
      customerId: post.userId,
      title: this.capitalize(post.title),
      description: post.body.replace(/\n/g, ' '),
      category: this.categories[(post.userId - 1) % this.categories.length],
      price: 20000 + ((post.id * 7919) % 480) * 1000,
      quantity: (post.id % 5) + 1,
      stock: (post.id * 7) % 15,
    };
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
