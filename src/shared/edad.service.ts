// Ruta: src/shared/edad.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class EdadService {
  /**
   * Calcula la edad actual en años a partir de una fecha de nacimiento
   * @param fechaNacimiento - Fecha en formato (YYYY-MM-DD)
   * @returns Edad en años
   */
  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();

    // Ajustar si aún no ha cumplido años este año
    if (
      mesActual < mesNacimiento ||
      (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())
    ) {
      edad--;
    }

    return edad;
  }

  /**
   * Valida si una persona puede tener login según su edad
   * Regla: Solo mayores de 10 años pueden tener login
   * @param fechaNacimiento - Fecha de nacimiento
   * @returns true si puede tener login, false si no
   */
  puedeCrearLogin(fechaNacimiento: string): boolean {
    const edad = this.calcularEdad(fechaNacimiento);
    return edad >= 10;
  }

  /**
   * Valida si una persona requiere apoderado
   * Regla: Menores de 18 años requieren apoderado
   * @param fechaNacimiento - Fecha de nacimiento
   * @returns true si requiere apoderado, false si no
   */
  requiereApoderado(fechaNacimiento: string): boolean {
    const edad = this.calcularEdad(fechaNacimiento);
    return edad < 18;
  }

  /**
   * Valida si una persona puede ser apoderado
   * Regla: Solo mayores de 18 años pueden ser apoderados
   * @param fechaNacimiento - Fecha de nacimiento
   * @returns true si puede ser apoderado, false si no
   */
  puedeSerApoderado(fechaNacimiento: string): boolean {
    const edad = this.calcularEdad(fechaNacimiento);
    return edad >= 18;
  }

  /**
   * Obtiene el rango de edad para validaciones
   * @param fechaNacimiento - Fecha de nacimiento
   * @returns Categoría de edad
   */
  obtenerRangoEdad(
    fechaNacimiento: string,
  ): 'menor_10' | 'menor_18' | 'mayor_18' {
    const edad = this.calcularEdad(fechaNacimiento);

    if (edad < 10) return 'menor_10';
    if (edad < 18) return 'menor_18';
    return 'mayor_18';
  }

  /**
   * Valida si la fecha de nacimiento es válida
   * @param fechaNacimiento - Fecha a validar
   * @returns true si es válida, false si no
   */
  esFechaValida(fechaNacimiento: string): boolean {
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();

    // Debe ser una fecha válida
    if (isNaN(fecha.getTime())) {
      return false;
    }

    // No puede ser fecha futura
    if (fecha > hoy) {
      return false;
    }

    // No puede ser mayor a 120 años
    const edad = this.calcularEdad(fechaNacimiento);
    if (edad > 120) {
      return false;
    }

    return true;
  }

  /**
   * Calcula cuántos días faltan para cumplir 18 años
   * Útil para notificaciones de liberación de apoderado
   * @param fechaNacimiento - Fecha de nacimiento
   * @returns Número de días hasta los 18 años (negativo si ya los cumplió)
   */
  diasHastaMayoriaEdad(fechaNacimiento: string): number {
    const nacimiento = new Date(fechaNacimiento);
    const cumple18 = new Date(nacimiento);
    cumple18.setFullYear(cumple18.getFullYear() + 18);

    const hoy = new Date();
    const diffTime = cumple18.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}
