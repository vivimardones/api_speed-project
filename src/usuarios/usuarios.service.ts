/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './CreateUsuarioDto';
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
export class UsuariosService {
  private usuariosCollection = collection(db, 'usuarios');
  async findAll() {
    const snapshot = await getDocs(this.usuariosCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  async findOne(id: string) {
    const usuarioDoc = await getDoc(doc(db, 'usuarios', id));
    return usuarioDoc.exists()
      ? { id: usuarioDoc.id, ...usuarioDoc.data() }
      : null;
  }
  async create(usuario: CreateUsuarioDto) {
    const nuevoUsuario = await addDoc(this.usuariosCollection, usuario);
    return { id: nuevoUsuario.id, ...usuario };
  }
  async update(id: string, usuario: Partial<CreateUsuarioDto>) {
    await updateDoc(doc(db, 'usuarios', id), usuario);
    return { id, ...usuario };
  }
  async remove(id: string) {
    await deleteDoc(doc(db, 'usuarios', id));
    return { message: `Usuario con ID ${id} eliminado` };
  }

  // Relaciones
  async getPerfilUsuario(usuarioId: string) {
    const usuarioDoc = await getDoc(doc(db, 'usuarios', usuarioId));
    if (usuarioDoc.exists()) {
      const usuarioData = usuarioDoc.data() as any;
      return usuarioData.perfilId ? { id: usuarioData.perfilId } : null;
    }
    return null;
  }

  async createPerfilUsuario(usuarioId: string, perfilData: any) {
    const perfilCollection = collection(db, 'perfiles');
    const nuevoPerfil = await addDoc(perfilCollection, {
      ...perfilData,
      usuarioId,
      createdAt: new Date(),
    });
    await updateDoc(doc(db, 'usuarios', usuarioId), {
      perfilId: nuevoPerfil.id,
    });
    return { id: nuevoPerfil.id, ...perfilData };
  }

  async getVehiculosUsuario(usuarioId: string) {
    const vehiculosRef = collection(db, 'vehiculos');
    const snapshot = await getDocs(vehiculosRef);
    const vehiculos = snapshot.docs
      .filter((doc) => (doc.data() as any).usuarioId === usuarioId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    return vehiculos;
  }

  async addVehiculo(usuarioId: string, vehiculoId: string) {
    const vehiculoRef = doc(db, 'vehiculos', vehiculoId);
    await updateDoc(vehiculoRef, { usuarioId });
    return {
      message: `Vehículo ${vehiculoId} agregado al usuario ${usuarioId}`,
    };
  }

  async getSaludUsuario(usuarioId: string) {
    const saludRef = collection(db, 'salud');
    const snapshot = await getDocs(saludRef);
    const saludData = snapshot.docs
      .filter((doc) => (doc.data() as any).usuarioId === usuarioId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    return saludData.length > 0 ? saludData[0] : null;
  }

  async createSaludUsuario(usuarioId: string, saludData: any) {
    const saludCollection = collection(db, 'salud');
    const nuevaSalud = await addDoc(saludCollection, {
      ...saludData,
      usuarioId,
      createdAt: new Date(),
    });
    return { id: nuevaSalud.id, ...saludData };
  }

  async getClubsUsuario(usuarioId: string) {
    const clubsRef = collection(db, 'clubes');
    const snapshot = await getDocs(clubsRef);
    const clubs = snapshot.docs
      .filter((doc) => {
        const usuariosClub = (doc.data() as any).usuarios || [];
        return (usuariosClub as string[]).includes(usuarioId);
      })
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    return clubs;
  }

  async addClub(usuarioId: string, clubId: string) {
    const clubRef = doc(db, 'clubes', clubId);
    const clubDoc = await getDoc(clubRef);
    if (clubDoc.exists()) {
      const usuarios = ((clubDoc.data() as any).usuarios || []) as string[];
      if (!usuarios.includes(usuarioId)) {
        usuarios.push(usuarioId);
        await updateDoc(clubRef, { usuarios });
      }
    }
    return { message: `Usuario ${usuarioId} agregado al club ${clubId}` };
  }

  async getAportadosUsuario(usuarioId: string) {
    const aportadosRef = collection(db, 'aportados');
    const snapshot = await getDocs(aportadosRef);
    const aportados = snapshot.docs
      .filter((doc) => (doc.data() as any).usuarioId === usuarioId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    return aportados;
  }

  async createAportado(usuarioId: string, aportadoData: any) {
    const aportadosCollection = collection(db, 'aportados');
    const nuevoAportado = await addDoc(aportadosCollection, {
      ...aportadoData,
      usuarioId,
      createdAt: new Date(),
    });
    return { id: nuevoAportado.id, ...aportadoData };
  }
}
