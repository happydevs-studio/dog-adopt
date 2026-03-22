-- Breed validation: sync full breed list, add synonym table, and enforce
-- validation in set_dog_breeds() so unknown breeds are rejected rather
-- than silently auto-created.

-- =========================================================================
-- 1. Seed ALL recognised breeds (from src/data/dogBreeds.ts ALL_DOG_BREEDS)
--    Uses ON CONFLICT to skip any that already exist.
-- =========================================================================
INSERT INTO dogadopt.breeds (name) VALUES
  ('Affenpinscher'), ('Afghan Hound'), ('Airedale Terrier'), ('Akbash'), ('Akita'),
  ('Alaskan Klee Kai'), ('Alaskan Malamute'), ('American Bulldog'), ('American Bully'),
  ('American Eskimo Dog'), ('American Foxhound'), ('American Hairless Terrier'),
  ('American Pit Bull Terrier'), ('American Staffordshire Terrier'), ('American Water Spaniel'),
  ('Anatolian Shepherd Dog'), ('Appenzeller Sennenhund'),
  ('Australian Cattle Dog'), ('Australian Kelpie'), ('Australian Shepherd'), ('Australian Terrier'),
  ('Azawakh'), ('Barbet'), ('Basenji'),
  ('Basset Bleu de Gascogne'), ('Basset Fauve de Bretagne'), ('Basset Hound'),
  ('Bavarian Mountain Hound'), ('Beagle'), ('Bearded Collie'), ('Beauceron'),
  ('Bedlington Terrier'), ('Belgian Malinois'), ('Belgian Sheepdog'), ('Belgian Tervuren'),
  ('Bergamasco Sheepdog'), ('Berger Picard'), ('Bernese Mountain Dog'), ('Bichon Frise'),
  ('Black and Tan Coonhound'), ('Black Russian Terrier'), ('Bloodhound'),
  ('Blue Lacy'), ('Bluetick Coonhound'), ('Boerboel'), ('Bolognese'),
  ('Border Collie'), ('Border Terrier'), ('Borzoi'), ('Boston Terrier'),
  ('Bouvier des Flandres'), ('Boxer'), ('Boykin Spaniel'), ('Bracco Italiano'),
  ('Briard'), ('Brittany'), ('Brussels Griffon'), ('Bull Terrier'), ('Bulldog'), ('Bullmastiff'),
  ('Cairn Terrier'), ('Canaan Dog'), ('Cane Corso'), ('Cardigan Welsh Corgi'),
  ('Carolina Dog'), ('Catahoula Leopard Dog'), ('Caucasian Shepherd Dog'),
  ('Cavalier King Charles Spaniel'), ('Central Asian Shepherd Dog'), ('Cesky Terrier'),
  ('Chesapeake Bay Retriever'), ('Chihuahua'), ('Chinese Crested'), ('Chinese Shar-Pei'),
  ('Chinook'), ('Chow Chow'), ('Cirneco dell''Etna'), ('Clumber Spaniel'),
  ('Cocker Spaniel'), ('Collie'), ('Coton de Tulear'), ('Curly-Coated Retriever'),
  ('Dachshund'), ('Dalmatian'), ('Dandie Dinmont Terrier'), ('Doberman Pinscher'),
  ('Dogo Argentino'), ('Dogue de Bordeaux'), ('Dutch Shepherd'),
  ('English Cocker Spaniel'), ('English Foxhound'), ('English Setter'),
  ('English Springer Spaniel'), ('English Toy Spaniel'),
  ('Entlebucher Mountain Dog'), ('Estrela Mountain Dog'), ('Eurasier'),
  ('Field Spaniel'), ('Finnish Lapphund'), ('Finnish Spitz'), ('Flat-Coated Retriever'),
  ('Fox Terrier (Smooth)'), ('Fox Terrier (Wire)'), ('French Bulldog'),
  ('German Pinscher'), ('German Shepherd'), ('German Shorthaired Pointer'),
  ('German Spitz'), ('German Wirehaired Pointer'), ('Giant Schnauzer'),
  ('Glen of Imaal Terrier'), ('Golden Retriever'), ('Gordon Setter'),
  ('Grand Basset Griffon Vendéen'), ('Great Dane'), ('Great Pyrenees'),
  ('Greater Swiss Mountain Dog'), ('Greyhound'),
  ('Hamiltonstovare'), ('Harrier'), ('Havanese'), ('Hovawart'),
  ('Ibizan Hound'), ('Icelandic Sheepdog'),
  ('Irish Red and White Setter'), ('Irish Setter'), ('Irish Terrier'),
  ('Irish Water Spaniel'), ('Irish Wolfhound'), ('Italian Greyhound'),
  ('Jack Russell Terrier'), ('Japanese Chin'), ('Japanese Spitz'), ('Jindo'),
  ('Kai Ken'), ('Karelian Bear Dog'), ('Keeshond'), ('Kerry Blue Terrier'),
  ('Komondor'), ('Kooikerhondje'), ('Korean Jindo'), ('Kuvasz'),
  ('Labrador Retriever'), ('Lagotto Romagnolo'), ('Lakeland Terrier'),
  ('Lancashire Heeler'), ('Leonberger'), ('Lhasa Apso'), ('Lowchen'), ('Lurcher'),
  ('Maltese'), ('Manchester Terrier'), ('Mastiff'),
  ('Miniature American Shepherd'), ('Miniature Bull Terrier'),
  ('Miniature Pinscher'), ('Miniature Schnauzer'), ('Mixed Breed'),
  ('Neapolitan Mastiff'), ('Newfoundland'), ('Norfolk Terrier'),
  ('Norwegian Buhund'), ('Norwegian Elkhound'), ('Norwegian Lundehund'),
  ('Norwich Terrier'), ('Nova Scotia Duck Tolling Retriever'),
  ('Old English Sheepdog'), ('Otterhound'), ('Papillon'),
  ('Parson Russell Terrier'), ('Patterdale Terrier'), ('Pekingese'),
  ('Pembroke Welsh Corgi'), ('Peruvian Inca Orchid'),
  ('Petit Basset Griffon Vendéen'), ('Pharaoh Hound'), ('Plott Hound'),
  ('Pointer'), ('Polish Lowland Sheepdog'), ('Pomeranian'),
  ('Poodle (Miniature)'), ('Poodle (Standard)'), ('Poodle (Toy)'),
  ('Portuguese Podengo Pequeno'), ('Portuguese Water Dog'), ('Pug'), ('Puli'), ('Pumi'),
  ('Pyrenean Mastiff'), ('Pyrenean Shepherd'),
  ('Rat Terrier'), ('Redbone Coonhound'), ('Rhodesian Ridgeback'), ('Rottweiler'), ('Russian Toy'),
  ('Saint Bernard'), ('Saluki'), ('Samoyed'), ('Schipperke'),
  ('Scottish Deerhound'), ('Scottish Terrier'), ('Sealyham Terrier'),
  ('Shetland Sheepdog'), ('Shiba Inu'), ('Shih Tzu'), ('Siberian Husky'),
  ('Silky Terrier'), ('Skye Terrier'), ('Sloughi'), ('Small Munsterlander'),
  ('Soft Coated Wheaten Terrier'), ('Spanish Mastiff'), ('Spanish Water Dog'),
  ('Spinone Italiano'), ('Staffordshire Bull Terrier'), ('Standard Schnauzer'),
  ('Sussex Spaniel'), ('Swedish Vallhund'),
  ('Tibetan Mastiff'), ('Tibetan Spaniel'), ('Tibetan Terrier'),
  ('Toy Fox Terrier'), ('Treeing Walker Coonhound'),
  ('Vizsla'), ('Weimaraner'), ('Welsh Springer Spaniel'), ('Welsh Terrier'),
  ('West Highland White Terrier'), ('Whippet'), ('Wire Fox Terrier'),
  ('Wirehaired Pointing Griffon'), ('Wirehaired Vizsla'), ('Xoloitzcuintli'),
  ('Yorkshire Terrier'),
  -- Cross-breeds
  ('Cockapoo'), ('Crossbreed'), ('Labradoodle'), ('Goldendoodle'), ('Cavapoo'),
  ('Puggle'), ('Yorkipoo'), ('Maltipoo'), ('Schnoodle'), ('Pomsky'),
  ('Shorkie'), ('Morkie'), ('Chorkie'),
  ('Aussiedoodle'), ('Bernedoodle'), ('Sheepadoodle'),
  -- Generic mixes
  ('Terrier Mix')
ON CONFLICT (name) DO NOTHING;


-- =========================================================================
-- 2. Breed synonyms table — maps informal/colloquial names to canonical
--    breed names.  Used by set_dog_breeds() for fuzzy resolution.
-- =========================================================================
CREATE TABLE IF NOT EXISTS dogadopt.breed_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synonym TEXT NOT NULL,
  canonical_breed_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT breed_synonyms_synonym_unique UNIQUE (synonym)
);

-- Index for fast case-insensitive lookups
CREATE INDEX IF NOT EXISTS idx_breed_synonyms_lower
  ON dogadopt.breed_synonyms (LOWER(synonym));

COMMENT ON TABLE dogadopt.breed_synonyms IS
  'Maps informal breed names and common abbreviations to their canonical breed name in the breeds table.';

-- Seed common synonyms (UK rescue sites frequently use these)
INSERT INTO dogadopt.breed_synonyms (synonym, canonical_breed_name) VALUES
  -- Staffie / Staffy variants
  ('Staffie', 'Staffordshire Bull Terrier'),
  ('Staffy', 'Staffordshire Bull Terrier'),
  ('Staff', 'Staffordshire Bull Terrier'),
  ('SBT', 'Staffordshire Bull Terrier'),
  ('Stafford', 'Staffordshire Bull Terrier'),
  ('Staffordshire Terrier', 'Staffordshire Bull Terrier'),
  ('Staffordshire', 'Staffordshire Bull Terrier'),
  ('Am Staff', 'American Staffordshire Terrier'),
  ('Amstaff', 'American Staffordshire Terrier'),

  -- Bull breed abbreviations
  ('Bully', 'Bulldog'),
  ('English Bulldog', 'Bulldog'),
  ('Frenchie', 'French Bulldog'),
  ('English Bull Terrier', 'Bull Terrier'),

  -- Collie variants
  ('BC', 'Border Collie'),
  ('Rough Collie', 'Collie'),
  ('Smooth Collie', 'Collie'),

  -- Shepherd variants
  ('GSD', 'German Shepherd'),
  ('Alsatian', 'German Shepherd'),
  ('German Shepherd Dog', 'German Shepherd'),
  ('Belgian Shepherd', 'Belgian Malinois'),
  ('Malinois', 'Belgian Malinois'),

  -- Retriever variants
  ('Lab', 'Labrador Retriever'),
  ('Labrador', 'Labrador Retriever'),
  ('Golden', 'Golden Retriever'),
  ('Goldie', 'Golden Retriever'),
  ('Flat Coat', 'Flat-Coated Retriever'),
  ('Flat Coated Retriever', 'Flat-Coated Retriever'),

  -- Spaniel variants
  ('Cocker', 'Cocker Spaniel'),
  ('English Cocker', 'English Cocker Spaniel'),
  ('Springer', 'English Springer Spaniel'),
  ('Springer Spaniel', 'English Springer Spaniel'),
  ('King Charles', 'Cavalier King Charles Spaniel'),
  ('King Charles Spaniel', 'Cavalier King Charles Spaniel'),
  ('Cavalier', 'Cavalier King Charles Spaniel'),
  ('Welsh Springer', 'Welsh Springer Spaniel'),

  -- Terrier variants
  ('JRT', 'Jack Russell Terrier'),
  ('Jack Russell', 'Jack Russell Terrier'),
  ('Westie', 'West Highland White Terrier'),
  ('West Highland Terrier', 'West Highland White Terrier'),
  ('Yorkie', 'Yorkshire Terrier'),
  ('Patterdale', 'Patterdale Terrier'),
  ('Lakeland', 'Lakeland Terrier'),
  ('Bedlington', 'Bedlington Terrier'),
  ('Wheaten', 'Soft Coated Wheaten Terrier'),
  ('Wheaten Terrier', 'Soft Coated Wheaten Terrier'),
  ('Scottie', 'Scottish Terrier'),
  ('Cairn', 'Cairn Terrier'),
  ('Wire Fox', 'Wire Fox Terrier'),
  ('Smooth Fox Terrier', 'Fox Terrier (Smooth)'),
  ('Wire Fox Terrier', 'Fox Terrier (Wire)'),
  ('Parson Russell', 'Parson Russell Terrier'),
  ('PRT', 'Parson Russell Terrier'),

  -- Sighthound variants
  ('Iggy', 'Italian Greyhound'),
  ('Grey', 'Greyhound'),
  ('Whippy', 'Whippet'),

  -- Husky / Spitz variants
  ('Husky', 'Siberian Husky'),
  ('Sibe', 'Siberian Husky'),
  ('Malamute', 'Alaskan Malamute'),
  ('Mal', 'Alaskan Malamute'),
  ('Pom', 'Pomeranian'),

  -- Poodle variants
  ('Miniature Poodle', 'Poodle (Miniature)'),
  ('Standard Poodle', 'Poodle (Standard)'),
  ('Toy Poodle', 'Poodle (Toy)'),
  ('Mini Poodle', 'Poodle (Miniature)'),
  ('Poodle', 'Poodle (Standard)'),

  -- Bull-mastiff / Mastiff variants
  ('English Mastiff', 'Mastiff'),
  ('Neo', 'Neapolitan Mastiff'),
  ('Neapolitan', 'Neapolitan Mastiff'),
  ('Tibetan Mast', 'Tibetan Mastiff'),

  -- Corgi variants
  ('Corgi', 'Pembroke Welsh Corgi'),
  ('Pembroke Corgi', 'Pembroke Welsh Corgi'),
  ('Cardigan Corgi', 'Cardigan Welsh Corgi'),

  -- Schnauzer variants
  ('Mini Schnauzer', 'Miniature Schnauzer'),
  ('Schnauzer', 'Standard Schnauzer'),

  -- Dachshund variants
  ('Sausage Dog', 'Dachshund'),
  ('Daxie', 'Dachshund'),
  ('Daschund', 'Dachshund'),
  ('Dachsund', 'Dachshund'),

  -- Other common abbreviations / informal names
  ('Shih-Tzu', 'Shih Tzu'),
  ('Shihtzu', 'Shih Tzu'),
  ('Lhasa', 'Lhasa Apso'),
  ('Weim', 'Weimaraner'),
  ('Viszla', 'Vizsla'),
  ('Ridgeback', 'Rhodesian Ridgeback'),
  ('Rhodesian', 'Rhodesian Ridgeback'),
  ('Dobie', 'Doberman Pinscher'),
  ('Doberman', 'Doberman Pinscher'),
  ('Dobermann', 'Doberman Pinscher'),
  ('Dane', 'Great Dane'),
  ('Saint', 'Saint Bernard'),
  ('St Bernard', 'Saint Bernard'),
  ('St. Bernard', 'Saint Bernard'),
  ('Newfie', 'Newfoundland'),
  ('OES', 'Old English Sheepdog'),
  ('Shar Pei', 'Chinese Shar-Pei'),
  ('Shar-Pei', 'Chinese Shar-Pei'),
  ('Sharpei', 'Chinese Shar-Pei'),
  ('Chinese Shar Pei', 'Chinese Shar-Pei'),
  ('Rottie', 'Rottweiler'),
  ('Rotty', 'Rottweiler'),
  ('Peke', 'Pekingese'),
  ('Papillion', 'Papillon'),
  ('Chi', 'Chihuahua'),
  ('Chih', 'Chihuahua'),
  ('Bichon', 'Bichon Frise'),

  -- Cross-breed synonyms
  ('Cross Breed', 'Crossbreed'),
  ('Cross breed', 'Crossbreed'),
  ('Mixed', 'Mixed Breed'),
  ('Mixed breed', 'Mixed Breed'),
  ('Mongrel', 'Crossbreed'),
  ('Mutt', 'Crossbreed'),
  ('Heinz 57', 'Crossbreed'),
  ('Terrier Cross', 'Terrier Mix'),
  ('Terrier cross', 'Terrier Mix'),
  ('Terrier X', 'Terrier Mix')
ON CONFLICT (synonym) DO NOTHING;


-- =========================================================================
-- 3. Helper: resolve a single breed name via synonyms → canonical lookup.
--    Returns the canonical breed name if found, or NULL if not recognised.
-- =========================================================================
CREATE OR REPLACE FUNCTION dogadopt.resolve_breed_name(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt
AS $$
DECLARE
  v_trimmed TEXT;
  v_canonical TEXT;
BEGIN
  v_trimmed := TRIM(p_name);
  IF v_trimmed = '' THEN RETURN NULL; END IF;

  -- 1. Direct match against breeds table (case-insensitive)
  SELECT name INTO v_canonical
  FROM dogadopt.breeds
  WHERE LOWER(name) = LOWER(v_trimmed);

  IF v_canonical IS NOT NULL THEN
    RETURN v_canonical;
  END IF;

  -- 2. Synonym lookup (case-insensitive)
  SELECT bs.canonical_breed_name INTO v_canonical
  FROM dogadopt.breed_synonyms bs
  WHERE LOWER(bs.synonym) = LOWER(v_trimmed);

  IF v_canonical IS NOT NULL THEN
    -- Verify the canonical name actually exists in breeds table
    PERFORM 1 FROM dogadopt.breeds WHERE LOWER(name) = LOWER(v_canonical);
    IF FOUND THEN
      RETURN v_canonical;
    END IF;
  END IF;

  -- 3. Not found
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION dogadopt.resolve_breed_name IS
  'Resolves a breed name (or synonym) to the canonical breed name. Returns NULL if unrecognised.';


-- =========================================================================
-- 4. Replace set_dog_breeds() — now validates against the breeds table
--    and resolves synonyms.  Rejects unknown breed names with a clear error.
-- =========================================================================
CREATE OR REPLACE FUNCTION dogadopt.set_dog_breeds(
  p_dog_id UUID,
  p_breed_names TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dogadopt
AS $$
DECLARE
  v_breed_name TEXT;
  v_resolved_name TEXT;
  v_breed_id UUID;
  v_order INT;
  v_unknown TEXT[];
BEGIN
  IF NOT dogadopt.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Access denied: set_dog_breeds() requires administrator or service role privileges'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- First pass: validate ALL breed names before making any changes.
  -- Collect unknown names so we can report them all at once.
  v_unknown := '{}';
  FOREACH v_breed_name IN ARRAY p_breed_names
  LOOP
    v_resolved_name := dogadopt.resolve_breed_name(v_breed_name);
    IF v_resolved_name IS NULL THEN
      v_unknown := array_append(v_unknown, TRIM(v_breed_name));
    END IF;
  END LOOP;

  IF array_length(v_unknown, 1) > 0 THEN
    RAISE EXCEPTION 'Unknown breed(s): %. Use a recognised breed name or add a synonym via the breed_synonyms table.',
      array_to_string(v_unknown, ', ')
      USING ERRCODE = 'data_exception';
  END IF;

  -- All names valid — apply changes.
  DELETE FROM dogadopt.dogs_breeds WHERE dog_id = p_dog_id;

  v_order := 1;
  FOREACH v_breed_name IN ARRAY p_breed_names
  LOOP
    v_resolved_name := dogadopt.resolve_breed_name(v_breed_name);

    SELECT id INTO v_breed_id
    FROM dogadopt.breeds
    WHERE LOWER(name) = LOWER(v_resolved_name);

    INSERT INTO dogadopt.dogs_breeds (dog_id, breed_id, display_order)
    VALUES (p_dog_id, v_breed_id, v_order);

    v_order := v_order + 1;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION dogadopt.set_dog_breeds IS
  'Set breeds for a dog. Validates breed names against recognised breeds and synonyms. Rejects unknown breeds. Requires admin or service_role.';


-- =========================================================================
-- 5. RLS for breed_synonyms: public read, admin/service-role write
-- =========================================================================
ALTER TABLE dogadopt.breed_synonyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY breed_synonyms_select ON dogadopt.breed_synonyms
  FOR SELECT USING (true);

CREATE POLICY breed_synonyms_admin_write ON dogadopt.breed_synonyms
  FOR ALL USING (dogadopt.is_admin_or_service_role());

GRANT SELECT ON dogadopt.breed_synonyms TO anon, authenticated;
GRANT ALL ON dogadopt.breed_synonyms TO service_role;


-- =========================================================================
-- 6. Expose resolve_breed_name via dogadopt_api for client-side validation
-- =========================================================================
CREATE OR REPLACE FUNCTION dogadopt_api.resolve_breed_name(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT dogadopt.resolve_breed_name(p_name);
$$;

GRANT EXECUTE ON FUNCTION dogadopt_api.resolve_breed_name(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION dogadopt_api.resolve_breed_name IS
  'Resolve a breed name or synonym to its canonical breed name. Returns NULL if not recognised.';
