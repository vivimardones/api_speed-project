/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { db } from '../firebase.config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { CreateNoticiaDto } from './createNoticiaDto';

@Injectable()
export class NoticiasService {
  private noticiasCollection = collection(db, 'noticias');

  // GET todas las noticias
  async findAll() {
    const snapshot = await getDocs(this.noticiasCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // GET una noticia por ID
  async findOne(id: string) {
    const noticiaDoc = await getDoc(doc(db, 'noticias', id));
    return noticiaDoc.exists()
      ? { id: noticiaDoc.id, ...noticiaDoc.data() }
      : null;
  }

  // POST crear noticia
  async create(noticia: CreateNoticiaDto) {
    const nueva = await addDoc(this.noticiasCollection, noticia);
    return { id: nueva.id, ...noticia };
  }

  // PUT actualizar noticia
  async update(id: string, noticia: Partial<CreateNoticiaDto>) {
    await updateDoc(doc(db, 'noticias', id), noticia);
    return { id, ...noticia };
  }

  // DELETE eliminar noticia
  async remove(id: string) {
    await deleteDoc(doc(db, 'noticias', id));
    return { mensaje: `Noticia con id ${id} eliminada` };
  }

  // Relaciones
  async getRamaDeportiva(noticiaId: string) {
    const noticiaDoc = await getDoc(doc(db, 'noticias', noticiaId));
    if (noticiaDoc.exists()) {
      const ramaDeportivaId = noticiaDoc.data().ramaDeportivaId;
      if (ramaDeportivaId) {
        const rama = await getDoc(doc(db, 'ramas-deportivas', ramaDeportivaId));
        return rama.exists() ? { id: rama.id, ...rama.data() } : null;
      }
    }
    return null;
  }

  async assignRamaDeportiva(noticiaId: string, ramaDeportivaId: string) {
    await updateDoc(doc(db, 'noticias', noticiaId), { ramaDeportivaId });
    return {
      message: `Rama deportiva ${ramaDeportivaId} asignada a noticia ${noticiaId}`,
    };
  }

  async getNoticiasByRamaDeportiva(ramaDeportivaId: string) {
    const snapshot = await getDocs(this.noticiasCollection);
    return snapshot.docs
      .filter((doc) => doc.data().ramaDeportivaId === ramaDeportivaId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getNoticiasByCategoria(categoria: string) {
    const snapshot = await getDocs(this.noticiasCollection);
    return snapshot.docs
      .filter((doc) => doc.data().categoria === categoria)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
