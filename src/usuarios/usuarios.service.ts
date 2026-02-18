// Ruta: src/usuarios/usuarios.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { CreateUsuarioDto, UpdateUsuarioDto, TipoIdentificador } from './dto';
import { IUsuario } from './interfaces/usuario.interface';
import {
  CreateUsuarioResponse,
  UpdateUsuarioResponse,
  DeleteUsuarioResponse,
} from './interfaces/usuario-response.interface';
import { RutService } from '../shared/rut.service';
import { EdadService } from '../shared/edad.service';
import { Rol } from '../auth/enums';

@Injectable()
export class UsuariosService {
  private readonly collectionName = 'usuarios';
  private readonly apoderadosDeportistasCollection = 'apoderados_deportistas';
  private readonly usuarioRolesCollection = 'usuario_roles';

  constructor(
    private readonly rutService: RutService,
    private readonly edadService: EdadService,
  ) {}

  /**
   * Crear un nuevo usuario
   */
  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<CreateUsuarioResponse> {
    // 1. Validar fecha de nacimiento
    if (!this.edadService.esFechaValida(createUsuarioDto.fechaNacimiento)) {
      throw new BadRequestException('La fecha de nacimiento no es válida');
    }

    // 2. Calcular edad
    const edad = this.edadService.calcularEdad(
      createUsuarioDto.fechaNacimiento,
    );

    // Variables de control
    let requiereApoderado = false;
    let advertenciaApoderado = false;

    // 3. Validar reglas de negocio según edad
    if (edad < 10) {
      // NIÑO (< 10 AÑOS)
      // - NO puede tener loginId
      // - DEBE tener apoderadoId (OBLIGATORIO)

      if (createUsuarioDto.loginId) {
        throw new BadRequestException(
          'Los menores de 10 años no pueden tener un login propio.',
        );
      }

      if (!createUsuarioDto.apoderadoId) {
        throw new BadRequestException(
          'Los menores de 10 años deben tener un apoderado asignado.',
        );
      }

      // Verificar que el apoderado existe y es mayor de 18 años
      await this.verificarApoderadoValido(createUsuarioDto.apoderadoId);
      requiereApoderado = true;
    } else if (edad >= 10 && edad < 18) {
      // ADOLESCENTE (10-17 AÑOS)
      // - loginId es OPCIONAL
      // - apoderadoId es OPCIONAL (temporal, debe asignarse después)

      if (createUsuarioDto.apoderadoId) {
        // Si tiene apoderado, verificar que sea válido
        await this.verificarApoderadoValido(createUsuarioDto.apoderadoId);
        requiereApoderado = true;
      } else {
        // No tiene apoderado, pero se permite (advertencia)
        advertenciaApoderado = true;
        requiereApoderado = true; // Sí requiere, pero se puede asignar después
      }
    } else {
      // ADULTO (>= 18 AÑOS)
      // - DEBE tener loginId (OBLIGATORIO)
      // - NO puede tener apoderadoId

      if (!createUsuarioDto.loginId) {
        throw new BadRequestException(
          'Los mayores de 18 años deben tener un login asociado.',
        );
      }

      if (createUsuarioDto.apoderadoId) {
        throw new BadRequestException(
          'Los mayores de 18 años no pueden tener un apoderado asignado.',
        );
      }
    }

    // 4. Validar RUT si el tipo de identificador es RUT
    if (
      createUsuarioDto.tipoIdentificador === TipoIdentificador.RUT ||
      createUsuarioDto.tipoIdentificador === TipoIdentificador.RUT_PROVISORIO
    ) {
      const rutCompleto = `${createUsuarioDto.numeroIdentificador}`;

      if (!this.rutService.validarRut(rutCompleto)) {
        throw new BadRequestException(
          'El RUT ingresado no es válido. Verifica el número y el dígito verificador.',
        );
      }

      createUsuarioDto.numeroIdentificador =
        this.rutService.limpiarRut(rutCompleto);
    }

    // 5. Validar formato de identificador según tipo
    if (
      !this.rutService.esIdentificadorValido(
        createUsuarioDto.tipoIdentificador,
        createUsuarioDto.numeroIdentificador,
      )
    ) {
      throw new BadRequestException(
        `El formato del identificador no es válido para el tipo ${createUsuarioDto.tipoIdentificador}`,
      );
    }

    // 6. Verificar que el identificador sea único
    await this.verificarIdentificadorUnico(
      createUsuarioDto.tipoIdentificador,
      createUsuarioDto.numeroIdentificador,
    );

    // 7. Verificar que el teléfono sea único
    await this.verificarTelefonoUnico(createUsuarioDto.telefono);

    // 8. Si tiene loginId, verificar que el login existe y no esté ya asociado a otro usuario
    if (createUsuarioDto.loginId) {
      await this.verificarLoginDisponible(createUsuarioDto.loginId);
    }

    // 9. Crear el documento del usuario
    const usuariosCollection = collection(db, this.collectionName);
    const nuevoUsuario = {
      primerNombre: createUsuarioDto.primerNombre,
      segundoNombre: createUsuarioDto.segundoNombre || null,
      tercerNombre: createUsuarioDto.tercerNombre || null,
      apellidoPaterno: createUsuarioDto.apellidoPaterno,
      apellidoMaterno: createUsuarioDto.apellidoMaterno,
      fechaNacimiento: createUsuarioDto.fechaNacimiento,
      sexo: createUsuarioDto.sexo,
      tipoIdentificador: createUsuarioDto.tipoIdentificador,
      numeroIdentificador: createUsuarioDto.numeroIdentificador,
      telefono: createUsuarioDto.telefono,
      telefonoEmergencia: createUsuarioDto.telefonoEmergencia || null,
      loginId: createUsuarioDto.loginId || null,
      estado: 'activo',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(usuariosCollection, nuevoUsuario);

    // 10. Si tiene apoderado, crear la relación Y asignar rol de apoderado ← MODIFICADO
    if (createUsuarioDto.apoderadoId) {
      await this.crearRelacionApoderado(
        createUsuarioDto.apoderadoId,
        docRef.id,
      );

      // Asignar rol de apoderado al adulto si no lo tiene ← NUEVO
      await this.asignarRolApoderado(createUsuarioDto.apoderadoId);
    }

    // 11. Construir respuesta con tipado correcto
    const response: CreateUsuarioResponse = {
      success: true,
      message: 'Usuario creado exitosamente',
      id: docRef.id,
      edad: edad,
      requiereApoderado: requiereApoderado,
      tieneLogin: !!createUsuarioDto.loginId,
      tieneApoderado: !!createUsuarioDto.apoderadoId,
      advertencia: undefined,
      usuario: {
        id: docRef.id,
        ...nuevoUsuario,
      },
    };

    // Si es adolescente sin apoderado, agregar advertencia
    if (advertenciaApoderado) {
      response.advertencia =
        'Este usuario es menor de edad y requiere un apoderado asignado.';
    }

    return response;
  }

  /**
   * Obtener todos los usuarios
   */
  async findAll(): Promise<IUsuario[]> {
    const usuariosCollection = collection(db, this.collectionName);
    const snapshot = await getDocs(usuariosCollection);

    const usuarios = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IUsuario[];

    return usuarios;
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string) {
    const usuarioDoc = doc(db, this.collectionName, id);
    const snapshot = await getDoc(usuarioDoc);

    if (!snapshot.exists()) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as IUsuario;
  }

  /**
   * Buscar usuario por loginId
   */
  async findByLoginId(loginId: string): Promise<IUsuario | null> {
    const usuariosCollection = collection(db, this.collectionName);
    const q = query(usuariosCollection, where('loginId', '==', loginId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docData = snapshot.docs[0];
    return {
      id: docData.id,
      ...docData.data(),
    } as IUsuario;
  }

  /**
   * Buscar usuario por número de identificador
   */
  async findByIdentificador(
    numeroIdentificador: string,
  ): Promise<IUsuario | null> {
    const usuariosCollection = collection(db, this.collectionName);
    const q = query(
      usuariosCollection,
      where('numeroIdentificador', '==', numeroIdentificador),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docData = snapshot.docs[0];
    return {
      id: docData.id,
      ...docData.data(),
    } as IUsuario;
  }

  async asignarClub(id: string, clubId: string): Promise<void> {
    // Actualiza solo el clubId del usuario
    await this.update(id, { clubId } as UpdateUsuarioDto);
  }

  /**
   * Actualizar un usuario
   */
  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UpdateUsuarioResponse> {
    // Verificar que el usuario existe
    const usuarioExistente = await this.findOne(id);

    // Si se actualiza el identificador, validar
    if (updateUsuarioDto.numeroIdentificador) {
      // Si se actualiza el número pero no el tipo, usar el tipo existente
      const tipoIdentificador =
        updateUsuarioDto.tipoIdentificador ||
        (usuarioExistente.tipoIdentificador as TipoIdentificador);
      if (
        tipoIdentificador === TipoIdentificador.RUT ||
        tipoIdentificador === TipoIdentificador.RUT_PROVISORIO
      ) {
        const rutCompleto = updateUsuarioDto.numeroIdentificador;

        if (!this.rutService.validarRut(rutCompleto)) {
          throw new BadRequestException('El RUT ingresado no es válido');
        }

        updateUsuarioDto.numeroIdentificador =
          this.rutService.limpiarRut(rutCompleto);
      }

      // Verificar unicidad del nuevo identificador (excluyendo el usuario actual)
      await this.verificarIdentificadorUnico(
        tipoIdentificador,
        updateUsuarioDto.numeroIdentificador,
        id,
      );
    }
    // Si solo se actualiza el tipo de identificador (sin cambiar el número)
    if (
      updateUsuarioDto.tipoIdentificador &&
      !updateUsuarioDto.numeroIdentificador
    ) {
      throw new BadRequestException(
        'Si cambias el tipo de identificador, debes proporcionar también el número de identificador.',
      );
    }
    // Si se actualiza el teléfono, verificar unicidad
    if (updateUsuarioDto.telefono) {
      await this.verificarTelefonoUnico(updateUsuarioDto.telefono, id);
    }

    // Lógica de rol deportista según clubId
    if (updateUsuarioDto.clubId !== undefined) {
      if (updateUsuarioDto.clubId) {
        await this.asignarRolDeportista(id);
      } else {
        await this.quitarRolDeportista(id);
      }
    }

    // Actualizar el documento
    const usuarioDoc = doc(db, this.collectionName, id);
    const dataToUpdate: any = {
      ...updateUsuarioDto,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(usuarioDoc, dataToUpdate);

    return {
      success: true,
      message: 'Usuario actualizado exitosamente',
      id,
    };
  }

  /**
   * Asignar rol de deportista a un usuario si no lo tiene
   */
  private async asignarRolDeportista(usuarioId: string): Promise<void> {
    const rolesRef = collection(db, this.usuarioRolesCollection);
    const q = query(
      rolesRef,
      where('usuarioId', '==', usuarioId),
      where('rol', '==', Rol.DEPORTISTA),
      where('activo', '==', true),
    );
    const rolesSnapshot = await getDocs(q);

    // Si no tiene el rol, asignarlo
    if (rolesSnapshot.empty) {
      await addDoc(collection(db, this.usuarioRolesCollection), {
        usuarioId,
        rol: Rol.DEPORTISTA,
        activo: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  }

  /**
   * Quitar rol de deportista a un usuario
   */
  private async quitarRolDeportista(usuarioId: string): Promise<void> {
    const rolesRef = collection(db, this.usuarioRolesCollection);
    const q = query(
      rolesRef,
      where('usuarioId', '==', usuarioId),
      where('rol', '==', Rol.DEPORTISTA),
      where('activo', '==', true),
    );
    const rolesSnapshot = await getDocs(q);
    for (const docSnap of rolesSnapshot.docs) {
      await updateDoc(docSnap.ref, {
        activo: false,
        updatedAt: Timestamp.now(),
      });
    }
  }

  /**
   * Eliminar un usuario (soft delete cambiando estado a inactivo)
   */
  async remove(id: string): Promise<DeleteUsuarioResponse> {
    // Verificar que el usuario existe
    await this.findOne(id);

    const usuarioDoc = doc(db, this.collectionName, id);
    await updateDoc(usuarioDoc, {
      estado: 'inactivo',
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Usuario marcado como inactivo',
      id,
    };
  }

  /**
   * Eliminar permanentemente un usuario
   */
  async removePermanently(id: string): Promise<DeleteUsuarioResponse> {
    // Verificar que el usuario existe
    await this.findOne(id);

    const usuarioDoc = doc(db, this.collectionName, id);
    await deleteDoc(usuarioDoc);

    return {
      success: true,
      message: 'Usuario eliminado permanentemente',
      id,
    };
  }

  /**
   * Verificar que el identificador sea único
   */
  private async verificarIdentificadorUnico(
    tipoIdentificador: string,
    numeroIdentificador: string,
    excludeId?: string,
  ) {
    const usuariosCollection = collection(db, this.collectionName);
    const q = query(
      usuariosCollection,
      where('tipoIdentificador', '==', tipoIdentificador),
      where('numeroIdentificador', '==', numeroIdentificador),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      if (!excludeId || existingDoc.id !== excludeId) {
        throw new ConflictException(
          `Ya existe un usuario con el ${tipoIdentificador} ${numeroIdentificador}`,
        );
      }
    }
  }

  /**
   * Verificar que el teléfono sea único
   */
  private async verificarTelefonoUnico(telefono: string, excludeId?: string) {
    const usuariosCollection = collection(db, this.collectionName);
    const q = query(usuariosCollection, where('telefono', '==', telefono));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      if (!excludeId || existingDoc.id !== excludeId) {
        throw new ConflictException(
          `Ya existe un usuario con el teléfono ${telefono}`,
        );
      }
    }
  }

  /**
   * Verificar que el apoderado existe y es mayor de 18 años
   */
  private async verificarApoderadoValido(apoderadoId: string) {
    const apoderado = await this.findOne(apoderadoId);
    // Validar que fechaNacimiento existe y es string
    if (
      !apoderado.fechaNacimiento ||
      typeof apoderado.fechaNacimiento !== 'string'
    ) {
      throw new BadRequestException(
        'El apoderado debe tener una fecha de nacimiento válida registrada.',
      );
    }

    const edadApoderado = this.edadService.calcularEdad(
      apoderado.fechaNacimiento,
    );

    if (edadApoderado < 18) {
      throw new BadRequestException('El apoderado debe ser mayor de 18 años.');
    }

    if (apoderado.estado === 'inactivo') {
      throw new BadRequestException('El apoderado seleccionado está inactivo.');
    }
  }

  /**
   * Verificar que el loginId no esté ya asociado a otro usuario
   */
  private async verificarLoginDisponible(loginId: string) {
    const usuarioExistente = await this.findByLoginId(loginId);

    if (usuarioExistente) {
      throw new ConflictException(
        `El login con ID ${loginId} ya está asociado a otro usuario.`,
      );
    }
  }

  /**
   * Crear relación apoderado-deportista
   */
  private async crearRelacionApoderado(
    apoderadoId: string,
    deportistaId: string,
  ) {
    const relacionCollection = collection(
      db,
      this.apoderadosDeportistasCollection,
    );
    await addDoc(relacionCollection, {
      apoderadoId,
      deportistaId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Asignar rol de apoderado a un usuario si no lo tiene ← NUEVO MÉTODO
   */
  private async asignarRolApoderado(apoderadoId: string): Promise<void> {
    // Verificar si ya tiene el rol de apoderado
    const rolesRef = collection(db, this.usuarioRolesCollection);
    const q = query(
      rolesRef,
      where('usuarioId', '==', apoderadoId),
      where('rol', '==', Rol.APODERADO),
      where('activo', '==', true),
    );
    const rolesSnapshot = await getDocs(q);

    // Si no tiene el rol, asignarlo
    if (rolesSnapshot.empty) {
      await addDoc(collection(db, this.usuarioRolesCollection), {
        usuarioId: apoderadoId,
        rol: Rol.APODERADO,
        activo: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  }
}
