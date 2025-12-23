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
}
