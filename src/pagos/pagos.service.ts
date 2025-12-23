import { Injectable } from '@nestjs/common';
import { db } from '../firebase.config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { CreatePagosDto } from './CreatePagosDto';

@Injectable()
export class PagosService {
  private pagosCollection = collection(db, 'pagos');

  async findAll() {
    const snapshot = await getDocs(this.pagosCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // GET un pago por ID
  async findOne(id: string) {
    const pagoDoc = await getDoc(doc(db, 'pagos', id));
    return pagoDoc.exists() ? { id: pagoDoc.id, ...pagoDoc.data() } : null;
  }

  // POST crear pago
  async create(pago: CreatePagosDto) {
    const nuevo = await addDoc(this.pagosCollection, pago);
    return { id: nuevo.id, ...pago };
  }

  // PUT actualizar pago
  async update(id: string, pago: Partial<CreatePagosDto>) {
    await updateDoc(doc(db, 'pagos', id), pago);
    return { id, ...pago };
  }

  // DELETE eliminar pago
  async remove(id: string) {
    await deleteDoc(doc(db, 'pagos', id));
    return { mensaje: `Pago con id ${id} eliminado` };
  }
}
