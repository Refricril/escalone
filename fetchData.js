require('dotenv').config(); // Carrega as variáveis do arquivo .env

const { MongoClient } = require('mongodb');

// Função para conectar e buscar dados
async function fetchData() {
    const uri = process.env.MONGODB_URI; // Puxa a URI do banco do .env
    const client = new MongoClient(uri);

    try {
        console.log("🔄 Conectando ao MongoDB...");
        await client.connect();
        console.log("✅ Conexão bem-sucedida!");

        const db = client.db('escalone'); // Substitua pelo nome do banco
        const collection = db.collection('testCollection'); // Substitua pelo nome da coleção

        // Busca os dados
        const data = await collection.find({}).toArray();
        console.log("📂 Dados encontrados:", data);
    } catch (err) {
        console.error("❌ Erro ao buscar dados:", err);
    } finally {
        await client.close();
        console.log("🔒 Conexão encerrada.");
    }
}

// Executa a função
fetchData();
