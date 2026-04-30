CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id_users UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenoms VARCHAR(100) NOT NULL,
    tel VARCHAR(20),
    matricule VARCHAR(50),
    region VARCHAR(50),
    district VARCHAR(50),
    commune VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    is_confirmed BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE doleance (
    id_doleance UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titre VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    images TEXT[],    
    region VARCHAR(50),
    district VARCHAR(50),
    commune VARCHAR(50),
    adresse TEXT,
    categorie VARCHAR(255),
    sousCategorie VARCHAR(255),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    numero VARCHAR(50)
);

CREATE TABLE doleance_support (
    doleance_id UUID NOT NULL REFERENCES doleance(id_doleance) ON DELETE CASCADE,
    userSupport TEXT[],
);

CREATE TABLE publications (
    id_publication UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titre TEXT,
    description TEXT,
    images TEXT[], 
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE publication_like (
    publication_id UUID NOT NULL REFERENCES publication(id_publication) ON DELETE CASCADE,
    userLike TEXT[], 
);

CREATE TABLE notification (
    id_notification UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    objet_id UUID,
    message TEXT NOT NULL,
    read_by TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);








ANJARA TABLE

CREATE TABLE "users2" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_compte VARCHAR(20) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    cin VARCHAR(20) UNIQUE,
    region VARCHAR(100),
    district VARCHAR(100),
    commune VARCHAR(100),
    code_commune CHAR(6) UNIQUE
);


CREATE TABLE communes (
    id SERIAL PRIMARY KEY,
    region VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    commune VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE projet (
    id_projet UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- ✅ ID unique pour chaque projet
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nom_projet VARCHAR(255) NOT NULL,
    type_projet VARCHAR(100),
    budget_total NUMERIC(14,2),
    budget_utilise NUMERIC(14,2) DEFAULT 0,
    nombre_ouvriers INT,
    date_debut DATE,
    date_prevue_fin DATE,
    date_reelle_fin DATE,
    statut VARCHAR(50) DEFAULT 'En cours',
    description TEXT,
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    images TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tache_projet (
    id_tache UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_projet UUID NOT NULL REFERENCES projet(id_projet) ON DELETE CASCADE,
    nom_tache VARCHAR(255) NOT NULL,
    description TEXT,
    poids_tache NUMERIC(5,2) DEFAULT 0,
    statut VARCHAR(50) DEFAULT 'Non commencé',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





SELECT id AS id_doleance FROM doleance 
WHERE user_id = '9cf02f15-c68d-4ae6-a120-b2661cf2b67e'
UNION ALL
SELECT id AS id_publication
FROM publications 
WHERE user_id = '9cf02f15-c68d-4ae6-a120-b2661cf2b67e';



SELECT 
  u.nom,
  u.prenoms,
  COUNT(d.id) AS nombre_doleances
FROM doleance d
JOIN users u ON d.user_id = u.id
JOIN users agent ON agent.id = '116a5092-d4b8-4b87-b6dc-ff86ba8b5f07'
WHERE d.region = agent.region
  AND d.district = agent.district
  AND d.commune = agent.commune
GROUP BY u.id, u.nom, u.prenoms
ORDER BY nombre_doleances DESC;
