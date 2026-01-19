/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';

@Injectable()
export class CategoriasService {
  async findAll() {
    const categoriasRef = collection(db, 'categorias');
    const snapshot = await getDocs(categoriasRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const categoriaRef = doc(db, 'categorias', id);
    const docSnap = await getDoc(categoriaRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  async create(categoriaData: any) {
    const docRef = await addDoc(collection(db, 'categorias'), {
      ...categoriaData,
      createdAt: new Date(),
    });
    return { id: docRef.id, ...categoriaData };
  }

  async update(id: string, categoriaData: any) {
    const categoriaRef = doc(db, 'categorias', id);
    await updateDoc(categoriaRef, {
      ...categoriaData,
      updatedAt: new Date(),
    });
    return { id, ...categoriaData };
  }

  async remove(id: string) {
    const categoriaRef = doc(db, 'categorias', id);
    await deleteDoc(categoriaRef);
    return { id };
  }

  async getSerie(categoriaId: string) {
    const categoriaRef = doc(db, 'categorias', categoriaId);
    const docSnap = await getDoc(categoriaRef);
    if (docSnap.exists() && (docSnap.data() as any).serieId) {
      const serieRef = doc(
        db,
        'series',
        (docSnap.data() as any).serieId as string,
      );
      const serieSnap = await getDoc(serieRef);
      return serieSnap.exists()
        ? { id: serieSnap.id, ...serieSnap.data() }
        : null;
    }
    return null;
  }

  async assignSerie(categoriaId: string, serieId: string) {
    const categoriaRef = doc(db, 'categorias', categoriaId);
    await updateDoc(categoriaRef, { serieId });
    return { categoriaId, serieId };
  }

  async getDeportistas(categoriaId: string) {
    const deportistasRef = collection(db, 'deportistas');
    const q = getDocs(deportistasRef);
    const snapshot = await q;
    const deportistas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((d) => d.categoriaId === categoriaId);
    return deportistas;
  }

  async getCategoriasBySerie(serieId: string) {
    const categoriasRef = collection(db, 'categorias');
    const snapshot = await getDocs(categoriasRef);
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((c) => c.serieId === serieId);
  }

  async getCategoriasByNombre(nombre: string) {
    const categoriasRef = collection(db, 'categorias');
    const snapshot = await getDocs(categoriasRef);
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter(
        (c) =>
          (c.nombre as string) &&
          (c.nombre as string).toLowerCase().includes(nombre.toLowerCase()),
      );
  }
}
