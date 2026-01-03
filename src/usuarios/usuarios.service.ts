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
}
