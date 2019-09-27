import { Entity, PrimaryGeneratedColumn, Column, getConnection } from 'typeorm';

@Entity()
export class Encode {
  @PrimaryGeneratedColumn()
  encodeId: number;

  @Column()
  inpath: string;

  @Column()
  outpath: string;
  
  @Column()
  options: string;

  @Column("float", { default: 0 })
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
      .where('encodeId = :encodeId', { encodeId })
      .execute();
  }
}
