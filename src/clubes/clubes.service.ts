/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import cloudinary from '../utils/cloudinary.config';
import { IClub, ICreateClubDto } from './interfaces/club.interface';
import { IMulterFile } from './interfaces/multer.interface';

@Injectable()
export class ClubesService {
  // ==========================================
  // MÉTODOS AUXILIARES DE VALIDACIÓN
  // ==========================================

  /**
   * Verificar que el nombre fantasía sea único
   */
  private async verificarNombreFantasiaUnico(
    nombreFantasia: string,
    excludeId?: string,
  ): Promise<void> {
    const clubesRef = collection(db, 'clubes');
    const q = query(clubesRef, where('nombreFantasia', '==', nombreFantasia));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      // Si estamos editando, permitir el mismo nombre si es el mismo club
      if (!excludeId || existingDoc.id !== excludeId) {
        throw new ConflictException(
          `Ya existe un club con el nombre "${nombreFantasia}"`,
        );
      }
    }
  }

  /**
   * Verificar que el RUT sea único
   */
  private async verificarRutUnico(
    rut: string,
    excludeId?: string,
  ): Promise<void> {
    if (!rut) return; // RUT es opcional

    const clubesRef = collection(db, 'clubes');
    const q = query(clubesRef, where('rut', '==', rut));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      if (!excludeId || existingDoc.id !== excludeId) {
        throw new ConflictException(`Ya existe un club con el RUT "${rut}"`);
      }
    }
  }

  /**
   * Verificar que el correo sea único
   */
  private async verificarCorreoUnico(
    correo: string,
    excludeId?: string,
  ): Promise<void> {
    if (!correo) return; // Correo es opcional

    const clubesRef = collection(db, 'clubes');
    const q = query(clubesRef, where('correo', '==', correo));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      if (!excludeId || existingDoc.id !== excludeId) {
        throw new ConflictException(
          `Ya existe un club con el correo "${correo}"`,
        );
      }
    }
  }

  // ==========================================
  // CRUD BÁSICO CON VALIDACIONES
  // ==========================================

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
    throw new NotFoundException(`Club con ID ${id} no encontrado`);
  }

  async create(clubData: ICreateClubDto): Promise<IClub> {
    // 1. Validar que el nombre fantasía sea único
    await this.verificarNombreFantasiaUnico(clubData.nombreFantasia);

    // 2. Validar que el RUT sea único (si existe)
    if (clubData.rut) {
      await this.verificarRutUnico(clubData.rut);
    }

    // 3. Validar que el correo sea único (si existe)
    if (clubData.correo) {
      await this.verificarCorreoUnico(clubData.correo);
    }

    // 4. Crear el club
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
    // 1. Verificar que el club existe
    await this.findOne(id);

    // 2. Validar nombre fantasía único (si se está actualizando)
    if (clubData.nombreFantasia) {
      await this.verificarNombreFantasiaUnico(clubData.nombreFantasia, id);
    }

    // 3. Validar RUT único (si se está actualizando)
    if (clubData.rut) {
      await this.verificarRutUnico(clubData.rut, id);
    }

    // 4. Validar correo único (si se está actualizando)
    if (clubData.correo) {
      await this.verificarCorreoUnico(clubData.correo, id);
    }

    // 5. Actualizar el club
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
    // Verificar que existe antes de eliminar
    await this.findOne(id);

    const clubRef = doc(db, 'clubes', id);
    await deleteDoc(clubRef);
    return { id };
  }

  // ==========================================
  // UPLOAD DE IMÁGENES (SIN CAMBIOS)
  // ==========================================

  async uploadImage(
    file: IMulterFile,
    clubId: string,
    type: 'escudo' | 'insignia',
  ): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          folder: `clubes/${clubId}`,
          public_id: type,
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' },
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

  // ==========================================
  // RELACIONES (SIN CAMBIOS)
  // ==========================================

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

  // ==========================================
  // MÉTODOS ADICIONALES ÚTILES
  // ==========================================

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
    await this.findOne(id); // Verificar que existe

    const clubRef = doc(db, 'clubes', id);
    await updateDoc(clubRef, {
      vigencia,
      updatedAt: new Date(),
    });
    return { id, vigencia };
  }
}
