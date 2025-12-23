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
export class AsistenciaService {
  private asistenciaCollection = collection(db, 'asistencia');

  async findAll() {
    const snapshot = await getDocs(this.asistenciaCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const asistenciaDoc = await getDoc(doc(db, 'asistencia', id));
    return asistenciaDoc.exists()
      ? { id: asistenciaDoc.id, ...asistenciaDoc.data() }
      : null;
  }

  async create(asistencia: {
    usuarioId: string;
    presente: boolean;
    fecha: string;
  }) {
    const nueva = await addDoc(this.asistenciaCollection, asistencia);
    return { id: nueva.id, ...asistencia };
  }

  async update(
    id: string,
    asistencia: Partial<{
      usuarioId: string;
      presente: boolean;
      fecha: string;
    }>,
  ) {
    await updateDoc(doc(db, 'asistencia', id), asistencia);
    return { id, ...asistencia };
  }

  async remove(id: string) {
    await deleteDoc(doc(db, 'asistencia', id));
    return { mensaje: `Registro de asistencia con id ${id} eliminado` };
  }
}
