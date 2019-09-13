import { Entity, PrimaryGeneratedColumn, Column, getConnection } from 'typeorm';

@Entity({ name: 'encode' })
export class Encode {
  @PrimaryGeneratedColumn({ name: '_id' })
  encodeId: number;

  @Column()
  inpath: string;

  @Column()
  outpath: string;
  
  @Column()
  options: string;

  @Column()
  progress: number;

  @Column()
  date: Date;
  
  static async findNotDone(): Promise<Encode[]> {
    return await getConnection()
      .getRepository(Encode)
      .createQueryBuilder()
      .where('progress < 100')
      .getMany();
  }

  static async updateProgress(encodeId: number, progress: number) {
    return await getConnection()
      .createQueryBuilder()
      .update(Encode)
      .set({ progress })
      .where('_id = :encodeId', { encodeId })
      .execute();
  }
}
