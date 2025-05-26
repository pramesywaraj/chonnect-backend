import { MigrationInterface, QueryRunner } from "typeorm";

export class EntitiesChangeForeignKeyNaming1748074961514 implements MigrationInterface {
    name = 'EntitiesChangeForeignKeyNaming1748074961514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_users" DROP CONSTRAINT "FK_9afe64dc52abd16b1830c8767b0"`);
        await queryRunner.query(`ALTER TABLE "room_users" DROP CONSTRAINT "UQ_f2b815e539627a21076b31a42e2"`);
        await queryRunner.query(`ALTER TABLE "room_users" RENAME COLUMN "userId" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "room_users" ADD CONSTRAINT "UQ_ba0fd8c93a7d079c1ebe5db4e16" UNIQUE ("room_id", "user_id")`);
        await queryRunner.query(`ALTER TABLE "room_users" ADD CONSTRAINT "FK_5421c55fb0212b9ff62fe9d3c89" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_users" DROP CONSTRAINT "FK_5421c55fb0212b9ff62fe9d3c89"`);
        await queryRunner.query(`ALTER TABLE "room_users" DROP CONSTRAINT "UQ_ba0fd8c93a7d079c1ebe5db4e16"`);
        await queryRunner.query(`ALTER TABLE "room_users" RENAME COLUMN "user_id" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "room_users" ADD CONSTRAINT "UQ_f2b815e539627a21076b31a42e2" UNIQUE ("room_id", "userId")`);
        await queryRunner.query(`ALTER TABLE "room_users" ADD CONSTRAINT "FK_9afe64dc52abd16b1830c8767b0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
