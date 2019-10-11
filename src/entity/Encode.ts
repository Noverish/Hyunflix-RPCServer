import { Entity, PrimaryGeneratedColumn, Column, getConnection, Between } from 'typeorm';

@Entity()
export class Encode {
  @PrimaryGeneratedColumn()
  id: number;

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
  
  static async findNotDone(): Promise<Encode | null> {
    return await getConnection()
      .getRepository(Encode)
      .findOne({ progress: Between(0, 99) });
  }

  static async updateProgress(id: number, progress: number) {
    return await getConnection()
      .createQueryBuilder()
      .update(Encode)
      .set({ progress })
      .where('id = :id', { id })
      .execute();
  }
  
  static async findAll(): Promise<Encode[]> {
    return await getConnection()
      .getRepository(Encode)
      .find({
        order: { id: "DESC" }
      });
  }

  static async insert(inpath: string, outpath: string, options: string): Promise<number> {
    const result = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Encode)
      .values({ inpath, outpath, options, date: new Date() })
      .execute();
    
    return result.identifiers[0].id;
  }
}
