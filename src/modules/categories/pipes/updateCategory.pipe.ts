import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UpdateCategoryDto } from '../dto/updateCategory.dto';

@Injectable()
export class UpdateCategoryPipe implements PipeTransform {
  async transform(body: UpdateCategoryDto) {
    if (body && Object.keys(body).length === 0) {
      throw new BadRequestException(
        'Необходимо передать в body хотя бы один параметр',
      );
    }

    return body;
  }
}
