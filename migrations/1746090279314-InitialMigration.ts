import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1746090279314 implements MigrationInterface {
    name = 'InitialMigration1746090279314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message_status" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "read_at" TIMESTAMP NOT NULL DEFAULT now(), "messageId" uuid, "senderId" uuid, CONSTRAINT "UQ_12ca5b0410dea019bd59d4b5c41" UNIQUE ("messageId", "senderId"), CONSTRAINT "PK_fd8b82470959145fdf427784046" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "senderId" uuid, "roomId" uuid, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "room" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "is_group" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "lastMessageId" uuid, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."room_users_role_enum" AS ENUM('ADMIN', 'MEMBER')`);
        await queryRunner.query(`CREATE TABLE "room_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "joined_at" TIMESTAMP NOT NULL DEFAULT now(), "role" "public"."room_users_role_enum" NOT NULL DEFAULT 'MEMBER', "roomId" uuid, "userId" uuid, CONSTRAINT "UQ_13fbb37ae42be6ad72b4724ec52" UNIQUE ("roomId", "userId"), CONSTRAINT "PK_6ba6f5ed6505258587bcf0e8db6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(30) NOT NULL, "email" character varying(40) NOT NULL, "password" character varying NOT NULL, "description" character varying NOT NULL, "profile_image" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message_status" ADD CONSTRAINT "FK_59b45c4131fa39314db82f5fb5e" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_status" ADD CONSTRAINT "FK_57db0b662822c1c48f2fb3a0dd0" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_aaa8a6effc7bd20a1172d3a3bc8" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_bc11c699eea4e4ad393e3bffbd5" FOREIGN KEY ("lastMessageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_users" ADD CONSTRAINT "FK_07600e6f053913a639e4478f2e5" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_users" ADD CONSTRAINT "FK_9afe64dc52abd16b1830c8767b0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_users" DROP CONSTRAINT "FK_9afe64dc52abd16b1830c8767b0"`);
        await queryRunner.query(`ALTER TABLE "room_users" DROP CONSTRAINT "FK_07600e6f053913a639e4478f2e5"`);
        await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_bc11c699eea4e4ad393e3bffbd5"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_aaa8a6effc7bd20a1172d3a3bc8"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`);
        await queryRunner.query(`ALTER TABLE "message_status" DROP CONSTRAINT "FK_57db0b662822c1c48f2fb3a0dd0"`);
        await queryRunner.query(`ALTER TABLE "message_status" DROP CONSTRAINT "FK_59b45c4131fa39314db82f5fb5e"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "room_users"`);
        await queryRunner.query(`DROP TYPE "public"."room_users_role_enum"`);
        await queryRunner.query(`DROP TABLE "room"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "message_status"`);
    }

}
