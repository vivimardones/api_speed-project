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
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase.config';

@Injectable()
export class RamasDeportivasService {
  async findAll() {
    const ramasRef = collection(db, 'ramas-deportivas');
    const snapshot = await getDocs(ramasRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const ramaRef = doc(db, 'ramas-deportivas', id);
    const docSnap = await getDoc(ramaRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  async create(ramaData: any) {
    const docRef = await addDoc(collection(db, 'ramas-deportivas'), {
      ...ramaData,
      createdAt: new Date(),
    });
    return { id: docRef.id, ...ramaData };
  }

  async update(id: string, ramaData: any) {
    const ramaRef = doc(db, 'ramas-deportivas', id);
    await updateDoc(ramaRef, {
      ...ramaData,
      updatedAt: new Date(),
    });
    return { id, ...ramaData };
  }

  async remove(id: string) {
    const ramaRef = doc(db, 'ramas-deportivas', id);
    await deleteDoc(ramaRef);
    return { id };
  }

  // Relaciones
  async getClub(ramaId: string) {
    const ramaRef = doc(db, 'ramas-deportivas', ramaId);
    const docSnap = await getDoc(ramaRef);
    if (docSnap.exists() && (docSnap.data() as any).clubId) {
      const clubRef = doc(
        db,
        'clubes',
        (docSnap.data() as any).clubId as string,
      );
      const clubSnap = await getDoc(clubRef);
      return clubSnap.exists() ? { id: clubSnap.id, ...clubSnap.data() } : null;
    }
    return null;
  }

  async assignClub(ramaId: string, clubId: string) {
    const ramaRef = doc(db, 'ramas-deportivas', ramaId);
    await updateDoc(ramaRef, { clubId });
    return { ramaId, clubId };
  }

  async getNoticias(ramaId: string) {
    const noticiasRef = collection(db, 'noticias');
    const snapshot = await getDocs(noticiasRef);
    const noticias = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((n) => n.ramaDeportivaId === ramaId);
    return noticias;
  }

  async addNoticia(ramaId: string, noticiaId: string) {
    const ramaRef = doc(db, 'ramas-deportivas', ramaId);
    await updateDoc(ramaRef, { noticias: arrayUnion(noticiaId) });
    return { ramaId, noticiaId };
  }

  async getRamasByClub(clubId: string) {
    const ramasRef = collection(db, 'ramas-deportivas');
    const snapshot = await getDocs(ramasRef);
    const ramas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((r) => r.clubId === clubId);
    return ramas;
  }

  async getRamasByNombre(nombre: string) {
    const ramasRef = collection(db, 'ramas-deportivas');
    const snapshot = await getDocs(ramasRef);
    const ramas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter(
        (r) =>
          (r.nombre as string) &&
          (r.nombre as string).toLowerCase().includes(nombre.toLowerCase()),
      );
    return ramas;
  }
}
