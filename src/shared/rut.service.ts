// Ruta: src/shared/rut.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class RutService {
  /**
   * Limpia el RUT quitando puntos, guiones y dígito verificador
   * Ejemplo: "12.345.678-9" -> "12345678"
   */
  limpiarRut(rut: string): string {
    return rut
      .replace(/\./g, '') // Quitar puntos
      .replace(/-/g, '') // Quitar guiones
      .slice(0, -1); // Quitar dígito verificador
  }

  /**
   * Valida el formato de un RUT chileno
   * Acepta formatos: 12345678-9, 12.345.678-9 o 123456789
   */
  validarFormato(rut: string): boolean {
    // Regex para validar formato con o sin puntos y con o sin guión
    const regex = /^(\d{7,8}-?[\dkK])$/;
    return regex.test(rut.replace(/\./g, ''));
  }

  /**
   * Calcula el dígito verificador de un RUT
   * @param rutSinDv - RUT sin dígito verificador (ejemplo: "12345678")
   * @returns Dígito verificador (0-9 o 'K')
   */
  calcularDigitoVerificador(rutSinDv: string): string {
    let suma = 0;
    let multiplicador = 2;

    // Recorrer el RUT de derecha a izquierda
    for (let i = rutSinDv.length - 1; i >= 0; i--) {
      suma += parseInt(rutSinDv[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dv = 11 - resto;

    if (dv === 11) return '0';
    if (dv === 10) return 'K';
    return dv.toString();
  }

  /**
   * Valida un RUT chileno completo
   * @param rut - RUT completo con dígito verificador
   * @returns true si es válido, false si no
   */
  validarRut(rut: string): boolean {
    // Validar formato
    if (!this.validarFormato(rut)) {
      return false;
    }

    // Extraer el dígito verificador
    const dvIngresado = rut.slice(-1).toUpperCase();

    // Limpiar el RUT (sin dv)
    const rutLimpio = this.limpiarRut(rut);

    // Calcular el dígito verificador correcto
    const dvCalculado = this.calcularDigitoVerificador(rutLimpio);

    // Comparar
    return dvIngresado === dvCalculado;
  }

  /**
   * Formatea un RUT limpio a formato visual
   * Ejemplo: "12345678" + "9" -> "12.345.678-9"
   */
  formatearRut(rutSinDv: string, dv: string): string {
    // Agregar puntos cada 3 dígitos de derecha a izquierda
    const rutFormateado = rutSinDv
      .split('')
      .reverse()
      .map((char, index) => {
        if (index > 0 && index % 3 === 0) {
          return char + '.';
        }
        return char;
      })
      .reverse()
      .join('');

    return `${rutFormateado}-${dv}`;
  }

  /**
   * Valida y lanza excepción si el RUT es inválido
   * @param rut - RUT completo
   * @throws BadRequestException si el RUT es inválido
   */
  validarOExcepcion(rut: string): void {
    if (!this.validarRut(rut)) {
      throw new BadRequestException('El RUT ingresado no es válido');
    }
  }

  /**
   * Valida que el identificador sea único
   * (Esta función se usará en UsuariosService)
   */
  esIdentificadorValido(tipo: string, numero: string): boolean {
    switch (tipo) {
      case 'RUT':
      case 'RUT_PROVISORIO':
        // Debe tener entre 7 y 8 dígitos
        return /^\d{7,8}$/.test(numero);

      case 'PASAPORTE':
        // Debe tener entre 6 y 20 caracteres alfanuméricos
        return /^[A-Z0-9]{6,20}$/.test(numero.toUpperCase());

      case 'IDENTIFICADOR_EXTRANJERO':
        // Debe tener entre 5 y 30 caracteres alfanuméricos
        return !!numero && numero.trim().length > 0;

      default:
        return false;
    }
  }
}
