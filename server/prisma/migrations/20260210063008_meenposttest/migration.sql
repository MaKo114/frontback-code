-- CreateEnum
CREATE TYPE "Post_status" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "Posttest" (
    "post_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "Post_status" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Posttest_pkey" PRIMARY KEY ("post_id")
);

-- AddForeignKey
ALTER TABLE "Posttest" ADD CONSTRAINT "Posttest_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
