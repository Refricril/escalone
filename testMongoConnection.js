require('dotenv').config();
const { MongoClient } = require('mongodb');

// Carrega a URI do arquivo .env
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ A variável MONGODB_URI não está configurada no .env");
  process.exit(1);
}

async function testConnection() {
  const client = new MongoClient(uri);

  try {
    console.log("🔄 Tentando conectar ao MongoDB...");
    await client.connect();
    console.log("✅ Conexão ao MongoDB bem-sucedida!");

    // Lista os bancos de dados disponíveis
    const databasesList = await client.db().admin().listDatabases();
    console.log("📂 Bancos de dados disponíveis:");
    databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err.message);
  } finally {
    await client.close();
  }
}

testConnection();
