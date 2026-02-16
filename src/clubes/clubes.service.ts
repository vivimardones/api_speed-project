/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import cloudinary from '../utils/cloudinary.config';
import { IClub, ICreateClubDto } from './interfaces/club.interface';
import { IMulterFile } from './interfaces/multer.interface';

@Injectable()
export class ClubesService {
  // CRUD básico
  async findAll(): Promise<IClub[]> {
    const clubesRef = collection(db, 'clubes');
    const snapshot = await getDocs(clubesRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as IClub,
    );
  }

  async findOne(id: string): Promise<IClub | null> {
    const clubRef = doc(db, 'clubes', id);
    const docSnap = await getDoc(clubRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as IClub;
    }
    return null;
  }

  async create(clubData: ICreateClubDto): Promise<IClub> {
    const newClub = {
      ...clubData,
      vigencia: clubData.vigencia !== undefined ? clubData.vigencia : true,
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'clubes'), newClub);

    return {
      id: docRef.id,
      ...newClub,
    } as IClub;
  }

  async update(id: string, clubData: Partial<ICreateClubDto>): Promise<IClub> {
    const clubRef = doc(db, 'clubes', id);

    const updateData = {
      ...clubData,
      updatedAt: new Date(),
    };

    await updateDoc(clubRef, updateData);

    return {
      id,
      ...updateData,
    } as IClub;
  }

  async remove(id: string): Promise<{ id: string }> {
    const clubRef = doc(db, 'clubes', id);
    await deleteDoc(clubRef);
    return { id };
  }

  // Upload de imágenes a Cloudinary
  async uploadImage(
    file: IMulterFile,
    clubId: string,
    type: 'escudo' | 'insignia',
  ): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `clubes/${clubId}`,
          public_id: type,
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' },
            { format: 'webp' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            return reject(new Error(error.message));
          }

          if (!result) {
            return reject(new Error('No result from Cloudinary'));
          }

          // Usar .then() en vez de await
          const clubRef = doc(db, 'clubes', clubId);
          updateDoc(clubRef, {
            [type]: result.secure_url,
            updatedAt: new Date(),
          })
            .then(() => {
              resolve({ url: result.secure_url });
            })
            .catch((dbError) => {
              console.error('Error updating club in Firestore:', dbError);
              reject(new Error(String(dbError.message)));
            });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  // Eliminar imagen de Cloudinary
  async deleteImage(
    clubId: string,
    type: 'escudo' | 'insignia',
  ): Promise<{ success: boolean; message: string }> {
    try {
      const publicId = `clubes/${clubId}/${type}`;
      await cloudinary.uploader.destroy(publicId);

      const clubRef = doc(db, 'clubes', clubId);
      await updateDoc(clubRef, {
        [type]: null,
        updatedAt: new Date(),
      });

      return { success: true, message: 'Imagen eliminada correctamente' };
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }

  // Relaciones con usuarios
  async getUsuarios(clubId: string): Promise<unknown[]> {
    const usuariosRef = collection(db, 'usuarios');
    const snapshot = await getDocs(usuariosRef);
    const usuarios = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((u: any) => u.clubs?.includes(clubId));
    return usuarios;
  }

  async addUsuario(
    clubId: string,
    usuarioId: string,
  ): Promise<{ clubId: string; usuarioId: string }> {
    const clubRef = doc(db, 'clubes', clubId);
    await updateDoc(clubRef, { usuarios: arrayUnion(usuarioId) });
    return { clubId, usuarioId };
  }

  // Relaciones con ramas deportivas
  async getRamasDeportivas(clubId: string): Promise<unknown[]> {
    const ramasRef = collection(db, 'ramas-deportivas');
    const snapshot = await getDocs(ramasRef);
    const ramas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((r: any) => r.clubId === clubId);
    return ramas;
  }

  async createRamaDeportiva(
    clubId: string,
    ramaData: any,
  ): Promise<{ id: string; clubId: string; [key: string]: any }> {
    const docRef = await addDoc(collection(db, 'ramas-deportivas'), {
      ...ramaData,
      clubId,
      createdAt: new Date(),
    });
    return { id: docRef.id, clubId, ...ramaData };
  }

  // Relaciones con nóminas
  async getNominas(clubId: string): Promise<unknown[]> {
    const nominasRef = collection(db, 'nominas');
    const snapshot = await getDocs(nominasRef);
    const nominas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((n: any) => n.clubId === clubId);
    return nominas;
  }

  async addNomina(
    clubId: string,
    nominaId: string,
  ): Promise<{ clubId: string; nominaId: string }> {
    const clubRef = doc(db, 'clubes', clubId);
    await updateDoc(clubRef, { nominas: arrayUnion(nominaId) });
    return { clubId, nominaId };
  }

  // Métodos adicionales útiles
  async findByNombre(nombre: string): Promise<IClub[]> {
    const clubesRef = collection(db, 'clubes');
    const snapshot = await getDocs(clubesRef);
    const clubes = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as IClub)
      .filter(
        (c) =>
          c.nombreFantasia?.toLowerCase().includes(nombre.toLowerCase()) ||
          c.nombreReal?.toLowerCase().includes(nombre.toLowerCase()),
      );
    return clubes;
  }

  async findByRut(rut: string): Promise<IClub | null> {
    const clubesRef = collection(db, 'clubes');
    const snapshot = await getDocs(clubesRef);
    const clubes = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as IClub)
      .filter((c) => c.rut === rut);
    return clubes.length > 0 ? clubes[0] : null;
  }

  async findVigentes(): Promise<IClub[]> {
    const clubesRef = collection(db, 'clubes');
    const snapshot = await getDocs(clubesRef);
    const clubes = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as IClub)
      .filter((c) => c.vigencia === true);
    return clubes;
  }

  async updateVigencia(
    id: string,
    vigencia: boolean,
  ): Promise<{ id: string; vigencia: boolean }> {
    const clubRef = doc(db, 'clubes', id);
    await updateDoc(clubRef, {
      vigencia,
      updatedAt: new Date(),
    });
    return { id, vigencia };
  }
}
