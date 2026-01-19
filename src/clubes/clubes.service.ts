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
export class ClubesService {
  async findAll() {
    const clubesRef = collection(db, 'clubes');
    const snapshot = await getDocs(clubesRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const clubRef = doc(db, 'clubes', id);
    const docSnap = await getDoc(clubRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  async create(clubData: any) {
    const docRef = await addDoc(collection(db, 'clubes'), {
      ...clubData,
      createdAt: new Date(),
    });
    return { id: docRef.id, ...clubData };
  }

  async update(id: string, clubData: any) {
    const clubRef = doc(db, 'clubes', id);
    await updateDoc(clubRef, {
      ...clubData,
      updatedAt: new Date(),
    });
    return { id, ...clubData };
  }

  async remove(id: string) {
    const clubRef = doc(db, 'clubes', id);
    await deleteDoc(clubRef);
    return { id };
  }

  // Relaciones
  async getUsuarios(clubId: string) {
    const usuariosRef = collection(db, 'usuarios');
    const snapshot = await getDocs(usuariosRef);
    const usuarios = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((u) => (u.clubs as string[])?.includes(clubId));
    return usuarios;
  }

  async addUsuario(clubId: string, usuarioId: string) {
    const clubRef = doc(db, 'clubes', clubId);
    await updateDoc(clubRef, { usuarios: arrayUnion(usuarioId) });
    return { clubId, usuarioId };
  }

  async getRamasDeportivas(clubId: string) {
    const ramasRef = collection(db, 'ramas-deportivas');
    const snapshot = await getDocs(ramasRef);
    const ramas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((r) => r.clubId === clubId);
    return ramas;
  }

  async createRamaDeportiva(clubId: string, ramaData: any) {
    const docRef = await addDoc(collection(db, 'ramas-deportivas'), {
      ...ramaData,
      clubId,
      createdAt: new Date(),
    });
    return { id: docRef.id, clubId, ...ramaData };
  }

  async getNominas(clubId: string) {
    const nominasRef = collection(db, 'nominas');
    const snapshot = await getDocs(nominasRef);
    const nominas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((n) => n.clubId === clubId);
    return nominas;
  }

  async addNomina(clubId: string, nominaId: string) {
    const clubRef = doc(db, 'clubes', clubId);
    await updateDoc(clubRef, { nominas: arrayUnion(nominaId) });
    return { clubId, nominaId };
  }
}
