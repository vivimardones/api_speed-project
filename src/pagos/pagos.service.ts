/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

  // Relaciones
  async getDeportista(pagoId: string) {
    const pagoDoc = await getDoc(doc(db, 'pagos', pagoId));
    if (pagoDoc.exists()) {
      const deportistaId = pagoDoc.data().deportistaId as string;
      if (deportistaId) {
        const deportista = await getDoc(doc(db, 'deportistas', deportistaId));
        return deportista.exists()
          ? { id: deportista.id, ...deportista.data() }
          : null;
      }
    }
    return null;
  }

  async assignDeportista(pagoId: string, deportistaId: string) {
    await updateDoc(doc(db, 'pagos', pagoId), { deportistaId });
    return { message: `Deportista ${deportistaId} asignado a pago ${pagoId}` };
  }

  async getPagosByDeportista(deportistaId: string) {
    const snapshot = await getDocs(this.pagosCollection);
    return snapshot.docs
      .filter((doc) => doc.data().deportistaId === deportistaId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getPagosByEstado(estado: string) {
    const snapshot = await getDocs(this.pagosCollection);
    return snapshot.docs
      .filter((doc) => doc.data().estado === estado)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getPagosByFecha(fechaInicio: string, fechaFin: string) {
    const snapshot = await getDocs(this.pagosCollection);
    return snapshot.docs
      .filter((doc) => {
        const fecha = doc.data().fecha as string;
        return fecha >= fechaInicio && fecha <= fechaFin;
      })
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
