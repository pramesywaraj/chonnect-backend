import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageStatusAddStatusEnumField1747515259364 implements MigrationInterface {
    name = 'MessageStatusAddStatusEnumField1747515259364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."message_status_status_enum" AS ENUM('SENT', 'DELIVERED', 'READ')`);
        await queryRunner.query(`ALTER TABLE "message_status" ADD "status" "public"."message_status_status_enum" NOT NULL DEFAULT 'SENT'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_status" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."message_status_status_enum"`);
    }

}
