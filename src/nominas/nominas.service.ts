/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
export class NominasService {
  async findAll() {
    const nominasRef = collection(db, 'nominas');
    const snapshot = await getDocs(nominasRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const nominaRef = doc(db, 'nominas', id);
    const docSnap = await getDoc(nominaRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  async create(nominaData: any) {
    const docRef = await addDoc(collection(db, 'nominas'), {
      ...nominaData,
      createdAt: new Date(),
    });
    return { id: docRef.id, ...nominaData };
  }

  async update(id: string, nominaData: any) {
    const nominaRef = doc(db, 'nominas', id);
    await updateDoc(nominaRef, {
      ...nominaData,
      updatedAt: new Date(),
    });
    return { id, ...nominaData };
  }

  async remove(id: string) {
    const nominaRef = doc(db, 'nominas', id);
    await deleteDoc(nominaRef);
    return { id };
  }

  // Relaciones
  async getClub(nominaId: string) {
    const nominaRef = doc(db, 'nominas', nominaId);
    const docSnap = await getDoc(nominaRef);
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

  async assignClub(nominaId: string, clubId: string) {
    const nominaRef = doc(db, 'nominas', nominaId);
    await updateDoc(nominaRef, { clubId });
    return { nominaId, clubId };
  }

  async getCampeonatos(nominaId: string) {
    const campeonatosRef = collection(db, 'campeonatos');
    const snapshot = await getDocs(campeonatosRef);
    const campeonatos = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((c) => c.nominaId === nominaId);
    return campeonatos;
  }

  async addCampeonato(nominaId: string, campeonatoId: string) {
    const nominaRef = doc(db, 'nominas', nominaId);
    await updateDoc(nominaRef, { campeonatos: arrayUnion(campeonatoId) });
    return { nominaId, campeonatoId };
  }

  async getSeries(nominaId: string) {
    const seriesRef = collection(db, 'series');
    const snapshot = await getDocs(seriesRef);
    const series = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((s) => s.nominaId === nominaId);
    return series;
  }

  async getNominasByClub(clubId: string) {
    const nominasRef = collection(db, 'nominas');
    const snapshot = await getDocs(nominasRef);
    const nominas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((n) => n.clubId === clubId);
    return nominas;
  }
}
