CREATE TABLE leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    email text,
    phone text,
    city text,
    project_description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);