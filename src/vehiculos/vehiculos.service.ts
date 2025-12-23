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
}
