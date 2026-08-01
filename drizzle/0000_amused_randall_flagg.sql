CREATE TABLE "behavior_profiles" (
	"project_slug" text PRIMARY KEY NOT NULL,
	"strategic_objectives" jsonb DEFAULT '[]'::jsonb,
	"decision_patterns" jsonb DEFAULT '[]'::jsonb,
	"risk_response" jsonb DEFAULT '[]'::jsonb,
	"trade_offs" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "conflicts" (
	"id" text PRIMARY KEY NOT NULL,
	"project_slug" text NOT NULL,
	"category" text,
	"title" text NOT NULL,
	"description" text,
	"severity" text DEFAULT 'Medium',
	"status" text DEFAULT 'Unresolved',
	"version_a" jsonb NOT NULL,
	"version_b" jsonb NOT NULL,
	"resolution" text,
	"affected_knowledge" jsonb DEFAULT '[]'::jsonb,
	"affected_phase" text,
	"updated_at" text
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" text PRIMARY KEY NOT NULL,
	"project_slug" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'Active',
	"description" text,
	"founded" text,
	"related_knowledge" jsonb DEFAULT '[]'::jsonb,
	"related_events" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"project_slug" text NOT NULL,
	"name" text NOT NULL,
	"date" text,
	"type" text NOT NULL,
	"participants" jsonb DEFAULT '[]'::jsonb,
	"description" text,
	"result" text,
	"source" text,
	"url" text,
	"affected_knowledge" jsonb DEFAULT '[]'::jsonb,
	"impact" text DEFAULT 'Medium'
);
--> statement-breakpoint
CREATE TABLE "evidence_items" (
	"id" text PRIMARY KEY NOT NULL,
	"knowledge_id" text NOT NULL,
	"event_id" text,
	"event_name" text NOT NULL,
	"date" text,
	"source" text,
	"url" text,
	"weight" integer DEFAULT 1 NOT NULL,
	"note" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_items" (
	"id" text PRIMARY KEY NOT NULL,
	"project_slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"description" text,
	"confidence" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'Stable',
	"updated_at" text,
	"author" text,
	"related_knowledge" jsonb DEFAULT '[]'::jsonb,
	"dependencies" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"ref_id" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"tagline" text,
	"description" text,
	"color" text,
	"accent" text,
	"status" text DEFAULT 'active',
	"cif_score" double precision DEFAULT 0 NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"knowledge_count" integer DEFAULT 0 NOT NULL,
	"conflict_count" integer DEFAULT 0 NOT NULL,
	"coverage" integer DEFAULT 0 NOT NULL,
	"entity_count" integer DEFAULT 0 NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL,
	"last_updated" date,
	"last_activity_hours" integer DEFAULT 0 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "qa_dimensions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_slug" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"score" double precision DEFAULT 0 NOT NULL,
	"weight" double precision DEFAULT 0 NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qa_phases" (
	"id" text PRIMARY KEY NOT NULL,
	"project_slug" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'Not Started',
	"score" double precision DEFAULT 0 NOT NULL,
	"owner" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"project_slug" text NOT NULL,
	"source" text NOT NULL,
	"target" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_views" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"scope" text NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"avatar_url" text,
	"role" text DEFAULT 'analyst',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "behavior_profiles" ADD CONSTRAINT "behavior_profiles_project_slug_projects_slug_fk" FOREIGN KEY ("project_slug") REFERENCES "public"."projects"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conflicts" ADD CONSTRAINT "conflicts_project_slug_projects_slug_fk" FOREIGN KEY ("project_slug") REFERENCES "public"."projects"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entities" ADD CONSTRAINT "entities_project_slug_projects_slug_fk" FOREIGN KEY ("project_slug") REFERENCES "public"."projects"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_project_slug_projects_slug_fk" FOREIGN KEY ("project_slug") REFERENCES "public"."projects"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_knowledge_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_project_slug_projects_slug_fk" FOREIGN KEY ("project_slug") REFERENCES "public"."projects"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qa_dimensions" ADD CONSTRAINT "qa_dimensions_project_slug_projects_slug_fk" FOREIGN KEY ("project_slug") REFERENCES "public"."projects"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qa_phases" ADD CONSTRAINT "qa_phases_project_slug_projects_slug_fk" FOREIGN KEY ("project_slug") REFERENCES "public"."projects"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_project_slug_projects_slug_fk" FOREIGN KEY ("project_slug") REFERENCES "public"."projects"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_source_entities_id_fk" FOREIGN KEY ("source") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_target_entities_id_fk" FOREIGN KEY ("target") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conflicts_project_idx" ON "conflicts" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "conflicts_severity_idx" ON "conflicts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "conflicts_status_idx" ON "conflicts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "entities_project_idx" ON "entities" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "entities_type_idx" ON "entities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "events_project_idx" ON "events" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "events_type_idx" ON "events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "events_date_idx" ON "events" USING btree ("date");--> statement-breakpoint
CREATE INDEX "evidence_knowledge_idx" ON "evidence_items" USING btree ("knowledge_id");--> statement-breakpoint
CREATE INDEX "knowledge_project_idx" ON "knowledge_items" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "knowledge_status_idx" ON "knowledge_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notes_scope_ref_idx" ON "notes" USING btree ("scope","ref_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "qa_project_idx" ON "qa_dimensions" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "qa_phases_project_idx" ON "qa_phases" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "rel_project_idx" ON "relationships" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "rel_source_idx" ON "relationships" USING btree ("source");--> statement-breakpoint
CREATE INDEX "rel_target_idx" ON "relationships" USING btree ("target");--> statement-breakpoint
CREATE INDEX "views_scope_idx" ON "saved_views" USING btree ("scope");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");