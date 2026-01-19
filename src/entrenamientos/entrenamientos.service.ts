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
export class EntrenamientosService {
  async findAll() {
    const entrenamientosRef = collection(db, 'entrenamientos');
    const snapshot = await getDocs(entrenamientosRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const entrenamientoRef = doc(db, 'entrenamientos', id);
    const docSnap = await getDoc(entrenamientoRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  async create(entrenamientoData: any) {
    const docRef = await addDoc(collection(db, 'entrenamientos'), {
      ...entrenamientoData,
      createdAt: new Date(),
    });
    return { id: docRef.id, ...entrenamientoData };
  }

  async update(id: string, entrenamientoData: any) {
    const entrenamientoRef = doc(db, 'entrenamientos', id);
    await updateDoc(entrenamientoRef, {
      ...entrenamientoData,
      updatedAt: new Date(),
    });
    return { id, ...entrenamientoData };
  }

  async remove(id: string) {
    const entrenamientoRef = doc(db, 'entrenamientos', id);
    await deleteDoc(entrenamientoRef);
    return { id };
  }

  // Relaciones
  async getAsistencias(entrenamientoId: string) {
    const asistenciasRef = collection(db, 'asistencias');
    const snapshot = await getDocs(asistenciasRef);
    const asistencias = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((a) => a.entrenamientoId === entrenamientoId);
    return asistencias;
  }

  async addAsistencia(entrenamientoId: string, asistenciaId: string) {
    const entrenamientoRef = doc(db, 'entrenamientos', entrenamientoId);
    await updateDoc(entrenamientoRef, {
      asistencias: arrayUnion(asistenciaId),
    });
    return { entrenamientoId, asistenciaId };
  }

  async getEntrenamientosByFecha(fecha: string) {
    const entrenamientosRef = collection(db, 'entrenamientos');
    const snapshot = await getDocs(entrenamientosRef);
    const entrenamientos = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((e) => (e.fecha as string) === fecha);
    return entrenamientos;
  }

  async getEntrenamientosByFechaRango(fechaInicio: string, fechaFin: string) {
    const entrenamientosRef = collection(db, 'entrenamientos');
    const snapshot = await getDocs(entrenamientosRef);
    const entrenamientos = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter(
        (e) =>
          (e.fecha as string) >= fechaInicio && (e.fecha as string) <= fechaFin,
      );
    return entrenamientos;
  }
}
