/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

@Injectable()
export class CampeonatosService {
  private campeonatosCollection = collection(db, 'campeonatos');

  async findAll() {
    const snapshot = await getDocs(this.campeonatosCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const campeonatoDoc = await getDoc(doc(db, 'campeonatos', id));
    return campeonatoDoc.exists()
      ? { id: campeonatoDoc.id, ...campeonatoDoc.data() }
      : null;
  }

  async create(campeonato: { nombre: string; fecha: string; lugar: string }) {
    const nuevo = await addDoc(this.campeonatosCollection, campeonato);
    return { id: nuevo.id, ...campeonato };
  }

  async update(
    id: string,
    campeonato: Partial<{ nombre: string; fecha: string; lugar: string }>,
  ) {
    await updateDoc(doc(db, 'campeonatos', id), campeonato);
    return { id, ...campeonato };
  }

  async remove(id: string) {
    await deleteDoc(doc(db, 'campeonatos', id));
    return { mensaje: `Campeonato con id ${id} eliminado` };
  }

  // Relaciones
  async getNominasCampeonato(campeonatoId: string) {
    const nominasRef = collection(db, 'nominas');
    const snapshot = await getDocs(nominasRef);
    const nominas = snapshot.docs
      .filter((doc) => {
        const campeonatos = doc.data().campeonatos || [];
        return campeonatos.includes(campeonatoId);
      })
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    return nominas;
  }

  async addNomina(campeonatoId: string, nominaId: string) {
    const nominaRef = doc(db, 'nominas', nominaId);
    const nominaDoc = await getDoc(nominaRef);
    if (nominaDoc.exists()) {
      const campeonatos = nominaDoc.data().campeonatos || [];
      if (!campeonatos.includes(campeonatoId)) {
        campeonatos.push(campeonatoId);
        await updateDoc(nominaRef, { campeonatos });
      }
    }
    return {
      message: `Nómina ${nominaId} agregada al campeonato ${campeonatoId}`,
    };
  }

  async getInscripcionesCampeonato(campeonatoId: string) {
    const inscripcionesRef = collection(db, 'inscripciones');
    const snapshot = await getDocs(inscripcionesRef);
    const inscripciones = snapshot.docs
      .filter((doc) => doc.data().campeonatoId === campeonatoId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    return inscripciones;
  }

  async getSeriesCampeonato(campeonatoId: string) {
    const seriesRef = collection(db, 'series');
    const snapshot = await getDocs(seriesRef);
    const series = snapshot.docs
      .filter((doc) => doc.data().campeonatoId === campeonatoId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    return series;
  }

  async createSerie(campeonatoId: string, serieData: any) {
    const seriesRef = collection(db, 'series');
    const nuevaSerie = await addDoc(seriesRef, {
      ...serieData,
      campeonatoId,
      createdAt: new Date(),
    });
    return { id: nuevaSerie.id, ...serieData };
  }

  async getCategoriasCampeonato(campeonatoId: string) {
    const categoriasRef = collection(db, 'categorias');
    const snapshot = await getDocs(categoriasRef);
    const categorias = snapshot.docs
      .filter((doc) => doc.data().campeonatoId === campeonatoId)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    return categorias;
  }

  async createCategoria(campeonatoId: string, categoriaData: any) {
    const categoriasRef = collection(db, 'categorias');
    const nuevaCategoria = await addDoc(categoriasRef, {
      ...categoriaData,
      campeonatoId,
      createdAt: new Date(),
    });
    return { id: nuevaCategoria.id, ...categoriaData };
  }
}
