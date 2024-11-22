import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('❌ Erro: A variável MONGODB_URI não foi definida no .env');
}

// Cache para evitar múltiplas conexões
let cached = (global as any).mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  (global as any).mongoose = cached;
}

async function connectToDatabase() {
  if (cached.conn) {
    console.log('✔️ Já conectado ao MongoDB!');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Conectando ao MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log('✅ Conectado ao MongoDB com sucesso!');
      return mongoose;
    }).catch((error) => {
      console.error('❌ Erro ao conectar ao MongoDB:', error);
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
