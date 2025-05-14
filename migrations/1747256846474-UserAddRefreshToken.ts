import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAddRefreshToken1747256846474 implements MigrationInterface {
    name = 'UserAddRefreshToken1747256846474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token" character varying`);
    }

}
