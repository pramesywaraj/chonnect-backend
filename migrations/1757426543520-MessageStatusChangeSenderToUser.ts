import { MigrationInterface, QueryRunner } from 'typeorm';

export class MessageStatusChangeSenderToUser1757426543520 implements MigrationInterface {
  name = 'MessageStatusChangeSenderToUser1757426543520';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message_status" ADD COLUMN "user_id" uuid`);

    await queryRunner.query(`UPDATE "message_status" SET "user_id" = "sender_id"`);

    await queryRunner.query(`
        ALTER TABLE "message_status"
        ADD CONSTRAINT "FK_message_status_user"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE    
    `);

    await queryRunner.query(`ALTER TABLE "message_status" ALTER COLUMN "user_id" SET NOT NULL`);

    await queryRunner.query(`
        ALTER TABLE "message_status"
        DROP CONSTRAINT IF EXISTS "UQ_message_status_message_sender"
    `);

    await queryRunner.query(`
        ALTER TABLE "message_status"
        ADD CONSTRAINT "UQ_message_status_message_user" UNIQUE ("message_id", "user_id")   
    `);

    await queryRunner.query(
      `ALTER TABLE "message_status" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_status" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    await queryRunner.query(`ALTER TABLE "message_status" ALTER COLUMN "read_at" DROP NOT NULL`);

    await queryRunner.query(`ALTER TABLE "message_status" DROP COLUMN "sender_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1) Recreate sender_id
    await queryRunner.query(`ALTER TABLE "message_status" ADD COLUMN "sender_id" uuid`);

    // 2) Backfill from user_id -> sender_id
    await queryRunner.query(`UPDATE "message_status" SET "sender_id" = "user_id"`);

    // 3) Restore unique on (message_id, sender_id)
    await queryRunner.query(
      `ALTER TABLE "message_status" DROP CONSTRAINT IF EXISTS "UQ_message_status_message_user"`,
    );
    await queryRunner.query(`
      ALTER TABLE "message_status"
      ADD CONSTRAINT "UQ_message_status_message_sender" UNIQUE ("message_id", "sender_id")
    `);

    // 4) Remove user FK, nullability and column
    await queryRunner.query(
      `ALTER TABLE "message_status" DROP CONSTRAINT IF EXISTS "FK_message_status_user"`,
    );
    await queryRunner.query(`ALTER TABLE "message_status" ALTER COLUMN "user_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "message_status" DROP COLUMN "user_id"`);

    // 5) (Optional) Restore read_at NOT NULL if that was the old state
    await queryRunner.query(`ALTER TABLE "message_status" ALTER COLUMN "read_at" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "message_status" DROP COLUMN IF EXISTS "updated_at"`);
    await queryRunner.query(`ALTER TABLE "message_status" DROP COLUMN IF EXISTS "created_at"`);
  }
}
