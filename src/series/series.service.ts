/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { db } from '../firebase.config';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

@Injectable()
export class SeriesService {
  private seriesCollection = collection(db, 'series');

  async findAll() {
    const snapshot = await getDocs(this.seriesCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const serieDoc = await getDoc(doc(db, 'series', id));
    return serieDoc.exists() ? { id: serieDoc.id, ...serieDoc.data() } : null;
  }

  async create(serieData: { nombre: string; nominaId: string }) {
    const nueva = await addDoc(this.seriesCollection, serieData);
    return { id: nueva.id, ...serieData };
  }

  async update(
    id: string,
    serieData: Partial<{ nombre: string; nominaId: string }>,
  ) {
    await updateDoc(doc(db, 'series', id), serieData);
    return { id, ...serieData };
  }

  async remove(id: string) {
    await deleteDoc(doc(db, 'series', id));
    return { mensaje: `Serie con id ${id} eliminada` };
  }

  // Relaciones
  async getNomina(serieId: string) {
    const serieDoc = await getDoc(doc(db, 'series', serieId));
    if (serieDoc.exists()) {
      const nominaId = serieDoc.data().nominaId;
      if (nominaId) {
        const nomina = await getDoc(doc(db, 'nominas', nominaId));
        return nomina.exists() ? { id: nomina.id, ...nomina.data() } : null;
      }
    }
    return null;
  }

  async assignNomina(serieId: string, nominaId: string) {
    await updateDoc(doc(db, 'series', serieId), { nominaId });
    return {
      message: `Nómina ${nominaId} asignada a serie ${serieId}`,
    };
  }

  async getCategorias(serieId: string) {
    const snapshot = await getDocs(collection(db, 'categorias'));
    return snapshot.docs
      .filter((doc) => doc.data().serieId === serieId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async createCategoria(serieId: string, categoriaData: { nombre: string }) {
    const nuevaCategoria = await addDoc(collection(db, 'categorias'), {
      ...categoriaData,
      serieId,
    });
    return { id: nuevaCategoria.id, ...categoriaData, serieId };
  }

  async getSeriesByNomina(nominaId: string) {
    const snapshot = await getDocs(this.seriesCollection);
    return snapshot.docs
      .filter((doc) => doc.data().nominaId === nominaId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getSeriesByNombre(nombre: string) {
    const snapshot = await getDocs(this.seriesCollection);
    return snapshot.docs
      .filter((doc) => doc.data().nombre === nombre)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
