import { Entity, PrimaryGeneratedColumn, Column, getConnection } from 'typeorm';

@Entity()
export class Youtube {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('tinyint', { default: 0 })
  isMusic: number;
  
  @Column()
  url: string;

  @Column()
  date: Date;
  
  static async findAll(): Promise<Youtube[]> {
    return await getConnection()
      .getRepository(Youtube)
      .find({
        order: { id: 'DESC' }
      });
  }
  
  static async findNotDone(): Promise<Youtube[]> {
    return await getConnection()
      .getRepository(Youtube)
      .createQueryBuilder()
      .where('ISNULL(finishDate)')
      .getMany();
  }
  
  static async insert(isMusic: boolean, url: string): Promise<number> {
    const result = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Youtube)
      .values({ url, isMusic: isMusic ? 1 : 0, date: new Date() })
      .execute();

    return result.identifiers[0].id;
  }
}