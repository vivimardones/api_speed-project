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

@Injectable()
export class CampeonatosService {
  private campeonatosCollection = collection(db, 'campeonatos');

  async findAll() {
    const snapshot = await getDocs(this.campeonatosCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const campeonatoDoc = await getDoc(doc(db, 'campeonatos', id));
    return campeonatoDoc.exists()
      ? { id: campeonatoDoc.id, ...campeonatoDoc.data() }
      : null;
  }

  async create(campeonato: { nombre: string; fecha: string; lugar: string }) {
    const nuevo = await addDoc(this.campeonatosCollection, campeonato);
    return { id: nuevo.id, ...campeonato };
  }

  async update(
    id: string,
    campeonato: Partial<{ nombre: string; fecha: string; lugar: string }>,
  ) {
    await updateDoc(doc(db, 'campeonatos', id), campeonato);
    return { id, ...campeonato };
  }

  async remove(id: string) {
    await deleteDoc(doc(db, 'campeonatos', id));
    return { mensaje: `Campeonato con id ${id} eliminado` };
  }
}
