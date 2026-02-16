export interface IDirigente {
  presidente?: string;
  secretario?: string;
  tesorero?: string;
  director?: string;
}

export interface IColores {
  primario?: string;
  secundario?: string;
  terciario?: string;
}

export interface IDireccion {
  calle?: string;
  numero?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
}

export interface IClub {
  id?: string;
  nombreFantasia: string;
  nombreReal: string;
  fechaIniciacion: string;
  rut?: string;
  dirigentes?: IDirigente;
  fechaVencimientoVigencia?: string;
  colores?: IColores;
  direccionSede?: IDireccion;
  escudo?: string;
  insignia?: string;
  vigencia?: boolean;
  correo?: string;
  telefono?: string;
  sitioWeb?: string;
  descripcion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateClubDto {
  nombreFantasia: string;
  nombreReal: string;
  fechaIniciacion: string;
  rut?: string;
  dirigentes?: IDirigente;
  fechaVencimientoVigencia?: string;
  colores?: IColores;
  direccionSede?: IDireccion;
  escudo?: string;
  insignia?: string;
  vigencia?: boolean;
  correo?: string;
  telefono?: string;
  sitioWeb?: string;
  descripcion?: string;
}
