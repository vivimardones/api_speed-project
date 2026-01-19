import { Injectable } from '@nestjs/common';
import { CreateInscripcionDto } from './create-incripciones.dto';
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
export class InscripcionesService {
  private inscripcionesCollection = collection(db, 'inscripciones');

  async findAll() {
    const snapshot = await getDocs(this.inscripcionesCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const inscripcionDoc = await getDoc(doc(db, 'inscripciones', id));
    return inscripcionDoc.exists()
      ? { id: inscripcionDoc.id, ...inscripcionDoc.data() }
      : null;
  }

  async create(inscripcion: CreateInscripcionDto) {
    const nueva = await addDoc(this.inscripcionesCollection, inscripcion);
    return { id: nueva.id, ...inscripcion };
  }

  async update(id: string, inscripcion: Partial<CreateInscripcionDto>) {
    await updateDoc(doc(db, 'inscripciones', id), inscripcion);
    return { id, ...inscripcion };
  }

  async remove(id: string) {
    await deleteDoc(doc(db, 'inscripciones', id));
    return { mensaje: `Inscripción con id ${id} eliminada` };
  }

  // Relaciones
  async getDeportista(inscripcionId: string) {
    const inscripcionDoc = await getDoc(
      doc(db, 'inscripciones', inscripcionId),
    );
    if (inscripcionDoc.exists()) {
      const deportistaId = inscripcionDoc.data().deportistaId as string;
      if (deportistaId) {
        const deportista = await getDoc(doc(db, 'deportistas', deportistaId));
        return deportista.exists()
          ? { id: deportista.id, ...deportista.data() }
          : null;
      }
    }
    return null;
  }

  async assignDeportista(inscripcionId: string, deportistaId: string) {
    await updateDoc(doc(db, 'inscripciones', inscripcionId), { deportistaId });
    return {
      message: `Deportista ${deportistaId} asignado a inscripción ${inscripcionId}`,
    };
  }

  async getCampeonato(inscripcionId: string) {
    const inscripcionDoc = await getDoc(
      doc(db, 'inscripciones', inscripcionId),
    );
    if (inscripcionDoc.exists()) {
      const campeonatoId = inscripcionDoc.data().campeonatoId as string;
      if (campeonatoId) {
        const campeonato = await getDoc(doc(db, 'campeonatos', campeonatoId));
        return campeonato.exists()
          ? { id: campeonato.id, ...campeonato.data() }
          : null;
      }
    }
    return null;
  }

  async assignCampeonato(inscripcionId: string, campeonatoId: string) {
    await updateDoc(doc(db, 'inscripciones', inscripcionId), { campeonatoId });
    return {
      message: `Campeonato ${campeonatoId} asignado a inscripción ${inscripcionId}`,
    };
  }

  async getInscripcionesByCampeonato(campeonatoId: string) {
    const snapshot = await getDocs(this.inscripcionesCollection);
    return snapshot.docs
      .filter((doc) => doc.data().campeonatoId === campeonatoId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getInscripcionesByDeportista(deportistaId: string) {
    const snapshot = await getDocs(this.inscripcionesCollection);
    return snapshot.docs
      .filter((doc) => doc.data().deportistaId === deportistaId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
