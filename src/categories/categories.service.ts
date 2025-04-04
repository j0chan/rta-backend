import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from 'src/categories/entities/category.entity'
import { Repository } from 'typeorm'

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) {}

    async readCategoryById(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { category_id: id } })
        if (!category) {
            throw new NotFoundException(`Category with id '${id}' not found`)
        }
        return category
    }

    async readCategoryAll(): Promise<Category[]> {
        return this.categoryRepository.find()
    }
}
