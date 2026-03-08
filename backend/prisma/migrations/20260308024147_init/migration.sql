-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('system', 'subsystem', 'module', 'component');

-- CreateEnum
CREATE TYPE "RatingTargetType" AS ENUM ('DA', 'compatibility');

-- CreateEnum
CREATE TYPE "AggregationMethod" AS ENUM ('min', 'median', 'average', 'weighted');

-- CreateTable
CREATE TABLE "systems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_nodes" (
    "id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "type" "NodeType" NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_alternatives" (
    "id" TEXT NOT NULL,
    "component_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER,
    "multiset_estimate" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_alternatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experts" (
    "id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "expertise" TEXT[],
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "reliability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "expert_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_type" "RatingTargetType" NOT NULL DEFAULT 'DA',
    "ordinal_value" INTEGER,
    "multiset_value" JSONB,
    "confidence" DOUBLE PRECISION,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compatibility_ratings" (
    "id" TEXT NOT NULL,
    "da1_id" TEXT NOT NULL,
    "da2_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "expert_ratings" JSONB,
    "aggregation_method" "AggregationMethod" NOT NULL DEFAULT 'median',
    "version" INTEGER NOT NULL DEFAULT 1,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compatibility_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solutions" (
    "id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "name" TEXT,
    "quality_vector" JSONB NOT NULL,
    "is_pareto_efficient" BOOLEAN NOT NULL DEFAULT false,
    "pareto_rank" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_selections" (
    "id" TEXT NOT NULL,
    "solution_id" TEXT NOT NULL,
    "component_id" TEXT NOT NULL,
    "da_id" TEXT NOT NULL,

    CONSTRAINT "solution_selections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "experts_system_id_email_key" ON "experts"("system_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_expert_id_target_id_target_type_key" ON "ratings"("expert_id", "target_id", "target_type");

-- CreateIndex
CREATE UNIQUE INDEX "compatibility_ratings_da1_id_da2_id_key" ON "compatibility_ratings"("da1_id", "da2_id");

-- CreateIndex
CREATE UNIQUE INDEX "solution_selections_solution_id_component_id_key" ON "solution_selections"("solution_id", "component_id");

-- AddForeignKey
ALTER TABLE "system_nodes" ADD CONSTRAINT "system_nodes_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_nodes" ADD CONSTRAINT "system_nodes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "system_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_alternatives" ADD CONSTRAINT "design_alternatives_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "system_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experts" ADD CONSTRAINT "experts_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "experts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "design_alternatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibility_ratings" ADD CONSTRAINT "compatibility_ratings_da1_id_fkey" FOREIGN KEY ("da1_id") REFERENCES "design_alternatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatibility_ratings" ADD CONSTRAINT "compatibility_ratings_da2_id_fkey" FOREIGN KEY ("da2_id") REFERENCES "design_alternatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_selections" ADD CONSTRAINT "solution_selections_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_selections" ADD CONSTRAINT "solution_selections_da_id_fkey" FOREIGN KEY ("da_id") REFERENCES "design_alternatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
