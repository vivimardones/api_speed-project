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

  // Relaciones
  async getDeportista(asistenciaId: string) {
    const asistenciaDoc = await getDoc(doc(db, 'asistencia', asistenciaId));
    if (asistenciaDoc.exists()) {
      const deportistaId = asistenciaDoc.data().deportistaId;
      if (deportistaId) {
        const deportista = await getDoc(doc(db, 'deportistas', deportistaId));
        return deportista.exists()
          ? { id: deportista.id, ...deportista.data() }
          : null;
      }
    }
    return null;
  }

  async assignDeportista(asistenciaId: string, deportistaId: string) {
    await updateDoc(doc(db, 'asistencia', asistenciaId), { deportistaId });
    return {
      message: `Deportista ${deportistaId} asignado a asistencia ${asistenciaId}`,
    };
  }

  async getEntrenamientos(asistenciaId: string) {
    const asistenciaDoc = await getDoc(doc(db, 'asistencia', asistenciaId));
    if (asistenciaDoc.exists()) {
      const entrenamientos = asistenciaDoc.data().entrenamientos || [];
      return entrenamientos;
    }
    return [];
  }

  async addEntrenamiento(asistenciaId: string, entrenamientoId: string) {
    const asistenciaDoc = await getDoc(doc(db, 'asistencia', asistenciaId));
    if (asistenciaDoc.exists()) {
      const entrenamientos = asistenciaDoc.data().entrenamientos || [];
      if (!entrenamientos.includes(entrenamientoId)) {
        entrenamientos.push(entrenamientoId);
        await updateDoc(doc(db, 'asistencia', asistenciaId), {
          entrenamientos,
        });
      }
    }
    return {
      message: `Entrenamiento ${entrenamientoId} agregado a asistencia ${asistenciaId}`,
    };
  }

  async getAsistenciaByDeportista(deportistaId: string) {
    const snapshot = await getDocs(this.asistenciaCollection);
    return snapshot.docs
      .filter((doc) => doc.data().deportistaId === deportistaId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getAsistenciaByDeportistaAndFecha(deportistaId: string, fecha: string) {
    const snapshot = await getDocs(this.asistenciaCollection);
    return snapshot.docs
      .filter(
        (doc) =>
          doc.data().deportistaId === deportistaId &&
          doc.data().fecha === fecha,
      )
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
