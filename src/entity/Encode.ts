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
      .where('progress < 99')
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
  
  static async findAll(): Promise<Encode[]> {
    return await getConnection()
      .getRepository(Encode)
      .createQueryBuilder()
      .orderBy('encodeId', 'DESC')
      .getMany();
  }

  static async insert(inpath: string, outpath: string, options: string): Promise<number> {
    const result = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Encode)
      .values({ inpath, outpath, options, date: new Date() })
      .execute();
    
    return result.identifiers[0].encodeId;
  }
}
