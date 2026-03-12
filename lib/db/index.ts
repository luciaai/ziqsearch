import { drizzle } from 'drizzle-orm/node-postgres';
import { withReplicas } from 'drizzle-orm/pg-core';
import { serverEnv } from '@/env/server';
import { RedisDrizzleCache } from '@databuddy/cache';
import Redis from 'ioredis';
import * as schema from './schema';
import { Pool } from 'pg';

const poolConfig = {
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
} as const;

let cache: RedisDrizzleCache | undefined;

try {
  const redis = new Redis(serverEnv.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  redis.on('error', (error) => {
    console.error('Drizzle cache Redis unavailable:', error);
  });

  cache = new RedisDrizzleCache({
    redis,
    defaultTtl: 20,
    strategy: 'explicit',
    namespace: 'scira:drizzle',
  });
} catch (error) {
  console.error('Failed to initialize Drizzle cache:', error);
}

function createDatabase(connectionString: string) {
  return drizzle({
    client: new Pool({
      connectionString,
      ...poolConfig,
    }),
    schema,
    ...(cache ? { cache } : {}),
  });
}

export const maindb = createDatabase(serverEnv.DATABASE_URL);

const readReplicas = [process.env.READ_DB_1, process.env.READ_DB_2]
  .filter((value): value is string => Boolean(value && value.trim()))
  .map((connectionString) => createDatabase(connectionString));

const REPLICA_WEIGHTS = [4, 6];
let currentIndex = -1;
let currentWeight = 0;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const MAX_WEIGHT = Math.max(...REPLICA_WEIGHTS);
const WEIGHT_GCD = REPLICA_WEIGHTS.reduce(gcd);

function selectReplica<T>(replicas: readonly T[]): T {
  if (!replicas.length) {
    throw new Error('No replicas configured');
  }

  const weights = REPLICA_WEIGHTS.slice(0, replicas.length);

  while (true) {
    currentIndex = (currentIndex + 1) % replicas.length;

    if (currentIndex === 0) {
      currentWeight -= WEIGHT_GCD;
      if (currentWeight <= 0) {
        currentWeight = MAX_WEIGHT;
      }
    }

    if (weights[currentIndex] >= currentWeight) {
      return replicas[currentIndex]!;
    }
  }
}

export const db =
  readReplicas.length > 0
    ? withReplicas(maindb, readReplicas as [typeof maindb, ...typeof maindb[]], (replicas) => selectReplica(replicas))
    : maindb;

type ReplicaClient = typeof maindb;

export function getReadReplica(): ReplicaClient {
  return readReplicas.length > 0 ? selectReplica(readReplicas) : maindb;
}

// Export all database instances for cache invalidation
export const allDatabases = [maindb, ...readReplicas] as const;