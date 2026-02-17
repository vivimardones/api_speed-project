import { FileValidator } from '@nestjs/common';
import { IMulterFile } from '../interfaces/multer.interface';

export class ImageFileValidator extends FileValidator {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  constructor() {
    super({});
  }

  isValid(file?: IMulterFile): boolean {
    if (!file) return false;
    return this.allowedMimeTypes.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return `El archivo debe ser una imagen válida (JPEG, PNG, WEBP)`;
  }
}
