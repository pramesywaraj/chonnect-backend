import { MigrationInterface, QueryRunner } from "typeorm";

export class RoomChangeLastMessageIdName1748078101539 implements MigrationInterface {
    name = 'RoomChangeLastMessageIdName1748078101539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_bc11c699eea4e4ad393e3bffbd5"`);
        await queryRunner.query(`ALTER TABLE "room" RENAME COLUMN "lastMessageId" TO "last_message_id"`);
        await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_7a83e549887cdd7b1939adee62c" FOREIGN KEY ("last_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_7a83e549887cdd7b1939adee62c"`);
        await queryRunner.query(`ALTER TABLE "room" RENAME COLUMN "last_message_id" TO "lastMessageId"`);
        await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_bc11c699eea4e4ad393e3bffbd5" FOREIGN KEY ("lastMessageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
