import { Entity, PrimaryGeneratedColumn, Column, getConnection } from 'typeorm';

@Entity()
export class Youtube {
  @PrimaryGeneratedColumn()
  youtubeId: number;

  @Column('tinyint', { default: 0 })
  isMusic: number;
  
  @Column()
  url: string;

  @Column()
  createDate: Date;
  
  @Column({ nullable: true })
  finishDate: Date | null;
  
  static async findAll(): Promise<Youtube[]> {
    return await getConnection()
      .getRepository(Youtube)
      .createQueryBuilder()
      .orderBy('youtubeId', 'DESC')
      .getMany();
  }
  
  static async findNotDone(): Promise<Youtube[]> {
    return await getConnection()
      .getRepository(Youtube)
      .createQueryBuilder()
      .where('ISNULL(finishDate)')
      .getMany();
  }
  
  static async updateDone(youtubeId): Promise<void> {
    await getConnection()
      .createQueryBuilder()
      .update(Youtube)
      .set({ finishDate: new Date })
      .where('youtubeId = :youtubeId', { youtubeId })
      .execute();
  }
  
  static async insert(isMusic: boolean, url: string): Promise<number> {
    const result = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Youtube)
      .values({ url, isMusic: isMusic ? 1 : 0, createDate: new Date() })
      .execute();

    return result.identifiers[0].youtubeId;
  }
}