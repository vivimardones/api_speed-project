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
} from 'firebase/firestore';
import { db } from '../firebase.config';

@Injectable()
export class DeportistasService {
  async findAll() {
    const deportistasRef = collection(db, 'deportistas');
    const snapshot = await getDocs(deportistasRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const deportistaRef = doc(db, 'deportistas', id);
    const docSnap = await getDoc(deportistaRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  async create(deportistaData: any) {
    const docRef = await addDoc(collection(db, 'deportistas'), {
      ...deportistaData,
      createdAt: new Date(),
    });
    return { id: docRef.id, ...deportistaData };
  }

  async update(id: string, deportistaData: any) {
    const deportistaRef = doc(db, 'deportistas', id);
    await updateDoc(deportistaRef, {
      ...deportistaData,
      updatedAt: new Date(),
    });
    return { id, ...deportistaData };
  }

  async remove(id: string) {
    const deportistaRef = doc(db, 'deportistas', id);
    await deleteDoc(deportistaRef);
    return { id };
  }

  // Relaciones
  async getUsuario(deportistaId: string) {
    const deportistaRef = doc(db, 'deportistas', deportistaId);
    const docSnap = await getDoc(deportistaRef);
    if (docSnap.exists() && (docSnap.data() as any).usuarioId) {
      const usuarioRef = doc(
        db,
        'usuarios',
        (docSnap.data() as any).usuarioId as string,
      );
      const usuarioSnap = await getDoc(usuarioRef);
      return usuarioSnap.exists()
        ? { id: usuarioSnap.id, ...usuarioSnap.data() }
        : null;
    }
    return null;
  }

  async assignUsuario(deportistaId: string, usuarioId: string) {
    const deportistaRef = doc(db, 'deportistas', deportistaId);
    await updateDoc(deportistaRef, { usuarioId });
    return { deportistaId, usuarioId };
  }

  async getVehiculo(deportistaId: string) {
    const deportistaRef = doc(db, 'deportistas', deportistaId);
    const docSnap = await getDoc(deportistaRef);
    if (docSnap.exists() && (docSnap.data() as any).vehiculoId) {
      const vehiculoRef = doc(
        db,
        'vehiculos',
        (docSnap.data() as any).vehiculoId as string,
      );
      const vehiculoSnap = await getDoc(vehiculoRef);
      return vehiculoSnap.exists()
        ? { id: vehiculoSnap.id, ...vehiculoSnap.data() }
        : null;
    }
    return null;
  }

  async assignVehiculo(deportistaId: string, vehiculoId: string) {
    const deportistaRef = doc(db, 'deportistas', deportistaId);
    await updateDoc(deportistaRef, { vehiculoId });
    return { deportistaId, vehiculoId };
  }

  async getInscripciones(deportistaId: string) {
    const inscripcionesRef = collection(db, 'inscripciones');
    const snapshot = await getDocs(inscripcionesRef);
    const inscripciones = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((i) => i.deportistaId === deportistaId);
    return inscripciones;
  }

  async getAsistencias(deportistaId: string) {
    const asistenciasRef = collection(db, 'asistencias');
    const snapshot = await getDocs(asistenciasRef);
    const asistencias = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((a) => a.deportistaId === deportistaId);
    return asistencias;
  }

  async getPagos(deportistaId: string) {
    const pagosRef = collection(db, 'pagos');
    const snapshot = await getDocs(pagosRef);
    const pagos = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((p) => p.deportistaId === deportistaId);
    return pagos;
  }

  async getDeportistasByCategoria(categoriaId: string) {
    const deportistasRef = collection(db, 'deportistas');
    const snapshot = await getDocs(deportistasRef);
    const deportistas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
      .filter((d) => d.categoriaId === categoriaId);
    return deportistas;
  }
}
