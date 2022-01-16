import mongoose from 'mongoose';

interface MongoEnv {
    readonly hostname: string;
    readonly port: string;
    readonly user: string;
    readonly password: string;
    readonly adminDb: string;
    readonly db: string;
}

const createConnectionString = (env: MongoEnv): string =>
    `mongodb://${env.user}:${env.password}@${env.hostname}:${env.port}/${env.db}?authSource=${env.adminDb}&tls=true&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true`;

const password: string = (process.env.MONGO_PASSWORD ?? process.env.MONGO_ROOT_PASSWORD)!;

const mongoEnv: MongoEnv = {
    hostname: process.env.MONGO_HOSTNAME!,
    port: process.env.MONGO_PORT!,
    user: process.env.MONGO_USER!,
    password,
    adminDb: process.env.MONGO_AUTH_DB!,
    db: process.env.MONGO_DB!
}

const connectionString = createConnectionString(mongoEnv);
console.log('Connection String', connectionString);

mongoose.connect(connectionString)
    .then(() => {
        console.log('Mongoose is connected')
    })
    .catch((ex) => {
        console.error('Error connecting to Mongoose');
        console.error(ex);
    })