/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { db } from '../firebase.config';
import { CreateVehiculoDto } from './CreateVehiculoDto';
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
export class VehiculosService {
  private vehiculosCollection = collection(db, 'vehiculos');

  async findAll() {
    const snapshot = await getDocs(this.vehiculosCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const vehiculoDoc = await getDoc(doc(db, 'vehiculos', id));
    return vehiculoDoc.exists()
      ? { id: vehiculoDoc.id, ...vehiculoDoc.data() }
      : null;
  }

  async create(vehiculo: CreateVehiculoDto) {
    const nuevo = await addDoc(this.vehiculosCollection, vehiculo);
    return { id: nuevo.id, ...vehiculo };
  }

  async update(id: string, vehiculo: Partial<CreateVehiculoDto>) {
    await updateDoc(doc(db, 'vehiculos', id), vehiculo);
    return { id, ...vehiculo };
  }

  async remove(id: string) {
    await deleteDoc(doc(db, 'vehiculos', id));
    return { mensaje: `Vehículo con id ${id} eliminado` };
  }

  // Relaciones
  async getUsuario(vehiculoId: string) {
    const vehiculoDoc = await getDoc(doc(db, 'vehiculos', vehiculoId));
    if (vehiculoDoc.exists()) {
      const usuarioId = vehiculoDoc.data().usuarioId as string;
      if (usuarioId) {
        const usuario = await getDoc(doc(db, 'usuarios', usuarioId));
        return usuario.exists() ? { id: usuario.id, ...usuario.data() } : null;
      }
    }
    return null;
  }

  async assignUsuario(vehiculoId: string, usuarioId: string) {
    await updateDoc(doc(db, 'vehiculos', vehiculoId), { usuarioId });
    return {
      message: `Usuario ${usuarioId} asignado a vehículo ${vehiculoId}`,
    };
  }

  async getDeportista(vehiculoId: string) {
    const vehiculoDoc = await getDoc(doc(db, 'vehiculos', vehiculoId));
    if (vehiculoDoc.exists()) {
      const deportistaId = vehiculoDoc.data().deportistaId as string;
      if (deportistaId) {
        const deportista = await getDoc(doc(db, 'deportistas', deportistaId));
        return deportista.exists()
          ? { id: deportista.id, ...deportista.data() }
          : null;
      }
    }
    return null;
  }

  async assignDeportista(vehiculoId: string, deportistaId: string) {
    await updateDoc(doc(db, 'vehiculos', vehiculoId), { deportistaId });
    return {
      message: `Deportista ${deportistaId} asignado a vehículo ${vehiculoId}`,
    };
  }

  async getVehiculosByUsuario(usuarioId: string) {
    const snapshot = await getDocs(this.vehiculosCollection);
    return snapshot.docs
      .filter((doc) => doc.data().usuarioId === usuarioId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getVehiculosByMarca(marca: string) {
    const snapshot = await getDocs(this.vehiculosCollection);
    return snapshot.docs
      .filter((doc) => doc.data().marca === marca)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
