/**
 * MemeSeal - Proof-of-Prediction System
 * "Trust Me" → "Prove It"
 *
 * Creates immutable timestamps for predictions that can be:
 * 1. Stored on-chain (TON) for permanent proof
 * 2. Used as oracle data for SealBet prediction markets
 * 3. Build predictor reputation over time
 */

// Use Web Crypto API for Edge runtime compatibility

// Types
export interface Prediction {
  content: string; // The actual prediction text
  targetAddress?: string; // Token/wallet being predicted about
  predictionType: PredictionType;
  outcome?: "rug" | "moon" | "stable" | "custom";
  customOutcome?: string;
  timeframe?: number; // Days until resolution
  confidence?: number; // 1-100
}

export type PredictionType =
  | "rug_pull" // Will this token rug?
  | "price_target" // Will token hit price X?
  | "launch_success" // Will this launch succeed?
  | "whale_dump" // Will whale dump?
  | "custom"; // Free-form prediction

export interface Seal {
  id: string;
  hash: string; // SHA-256 of prediction content
  createdAt: number; // Unix timestamp
  creatorAddress: string; // TON wallet address
  prediction: Prediction;
  status: SealStatus;
  onChainTx?: string; // TON transaction hash if stored on-chain
  resolution?: {
    outcome: string;
    resolvedAt: number;
    proof?: string;
  };
}

export type SealStatus =
  | "pending" // Created, not yet on-chain
  | "sealed" // Stored on-chain
  | "revealed" // Prediction content revealed
  | "resolved" // Outcome determined
  | "expired"; // Timeframe passed without resolution

// Seal storage (in production, use database)
const sealCache = new Map<string, Seal>();

/**
 * Generate a random hex string (Edge-compatible)
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * SHA-256 hash (Edge-compatible)
 */
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a new prediction seal
 * The prediction content is hashed - only the hash is stored initially
 * This prevents front-running while proving when the prediction was made
 */
export async function createSeal(
  prediction: Prediction,
  creatorAddress: string
): Promise<Seal> {
  const timestamp = Date.now();
  const nonce = generateNonce();

  // Create deterministic content string
  const contentString = JSON.stringify({
    ...prediction,
    creator: creatorAddress,
    timestamp,
    nonce,
  });

  // Hash the prediction
  const hash = await sha256(contentString);

  // Generate seal ID
  const id = `seal_${hash.slice(0, 12)}_${timestamp}`;

  const seal: Seal = {
    id,
    hash,
    createdAt: timestamp,
    creatorAddress,
    prediction,
    status: "pending",
  };

  // Store in cache
  sealCache.set(id, seal);

  return seal;
}

/**
 * Get seal by ID
 */
export function getSeal(sealId: string): Seal | undefined {
  return sealCache.get(sealId);
}

/**
 * Get all seals for a creator
 */
export function getSealsByCreator(creatorAddress: string): Seal[] {
  return Array.from(sealCache.values())
    .filter((seal) => seal.creatorAddress === creatorAddress)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get seals for a specific token/address
 */
export function getSealsByTarget(targetAddress: string): Seal[] {
  return Array.from(sealCache.values())
    .filter((seal) => seal.prediction.targetAddress === targetAddress)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Verify a seal's authenticity
 * Returns true if the provided prediction content matches the stored hash
 */
export async function verifySeal(
  sealId: string,
  predictionContent: string,
  creatorAddress: string,
  timestamp: number,
  nonce: string
): Promise<boolean> {
  const seal = sealCache.get(sealId);
  if (!seal) return false;

  // Reconstruct the content string
  const contentString = JSON.stringify({
    ...JSON.parse(predictionContent),
    creator: creatorAddress,
    timestamp,
    nonce,
  });

  // Hash and compare
  const hash = await sha256(contentString);

  return hash === seal.hash;
}

/**
 * Mark seal as stored on-chain
 */
export function markSealOnChain(sealId: string, txHash: string): Seal | null {
  const seal = sealCache.get(sealId);
  if (!seal) return null;

  seal.status = "sealed";
  seal.onChainTx = txHash;
  sealCache.set(sealId, seal);

  return seal;
}

/**
 * Resolve a prediction
 */
export function resolveSeal(
  sealId: string,
  outcome: string,
  proof?: string
): Seal | null {
  const seal = sealCache.get(sealId);
  if (!seal) return null;

  seal.status = "resolved";
  seal.resolution = {
    outcome,
    resolvedAt: Date.now(),
    proof,
  };
  sealCache.set(sealId, seal);

  return seal;
}

/**
 * Calculate predictor accuracy score
 */
export function calculatePredictorScore(creatorAddress: string): {
  totalPredictions: number;
  resolved: number;
  correct: number;
  accuracy: number;
  streak: number;
  reputation: "novice" | "apprentice" | "expert" | "oracle";
} {
  const seals = getSealsByCreator(creatorAddress);
  const resolved = seals.filter((s) => s.status === "resolved");

  // Count correct predictions (where outcome matched)
  const correct = resolved.filter((s) => {
    if (!s.resolution) return false;
    const predicted = s.prediction.outcome || s.prediction.customOutcome;
    return predicted === s.resolution.outcome;
  });

  // Calculate current streak
  let streak = 0;
  for (const seal of resolved.sort((a, b) => b.createdAt - a.createdAt)) {
    if (!seal.resolution) break;
    const predicted = seal.prediction.outcome || seal.prediction.customOutcome;
    if (predicted === seal.resolution.outcome) {
      streak++;
    } else {
      break;
    }
  }

  const accuracy =
    resolved.length > 0 ? (correct.length / resolved.length) * 100 : 0;

  // Determine reputation level
  let reputation: "novice" | "apprentice" | "expert" | "oracle" = "novice";
  if (resolved.length >= 50 && accuracy >= 70) {
    reputation = "oracle";
  } else if (resolved.length >= 20 && accuracy >= 60) {
    reputation = "expert";
  } else if (resolved.length >= 5 && accuracy >= 50) {
    reputation = "apprentice";
  }

  return {
    totalPredictions: seals.length,
    resolved: resolved.length,
    correct: correct.length,
    accuracy,
    streak,
    reputation,
  };
}

/**
 * Generate Tact smart contract code for on-chain seal storage
 * This is the contract that would be deployed to TON
 */
export function generateSealContract(): string {
  return `
// MemeSeal Contract - Tact Language
// Stores prediction hashes with timestamps on TON blockchain

message SealPrediction {
    predictionHash: Int as uint256;
    targetAddress: Address?;
    predictionType: Int as uint8;
    timeframeDays: Int as uint16;
}

message RevealPrediction {
    sealId: Int as uint256;
    fullContent: String;
}

message ResolvePrediction {
    sealId: Int as uint256;
    outcome: Int as uint8;
    proof: String;
}

struct PredictionSeal {
    hash: Int as uint256;
    creator: Address;
    timestamp: Int as uint64;
    targetAddress: Address?;
    predictionType: Int as uint8;
    timeframeDays: Int as uint16;
    status: Int as uint8; // 0=pending, 1=sealed, 2=revealed, 3=resolved
    outcome: Int as uint8;
}

contract MemeSeal(
    owner: Address,
    sealCount: Int as uint64,
) {
    // Mapping of seal ID to seal data
    seals: map<Int, PredictionSeal>;

    // Mapping of creator to their seal IDs
    creatorSeals: map<Address, Int>;

    // Seal a new prediction
    receive(msg: SealPrediction) {
        let ctx: Context = context();

        // Create seal
        let seal = PredictionSeal {
            hash: msg.predictionHash,
            creator: ctx.sender,
            timestamp: now(),
            targetAddress: msg.targetAddress,
            predictionType: msg.predictionType,
            timeframeDays: msg.timeframeDays,
            status: 1, // sealed
            outcome: 0
        };

        // Store seal
        self.sealCount = self.sealCount + 1;
        self.seals.set(self.sealCount, seal);

        // Return change
        cashback(ctx.sender);
    }

    // Resolve a prediction (oracle function)
    receive(msg: ResolvePrediction) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Only owner can resolve");

        let seal = self.seals.get(msg.sealId);
        if (seal != null) {
            let updated = PredictionSeal {
                hash: seal!!.hash,
                creator: seal!!.creator,
                timestamp: seal!!.timestamp,
                targetAddress: seal!!.targetAddress,
                predictionType: seal!!.predictionType,
                timeframeDays: seal!!.timeframeDays,
                status: 3, // resolved
                outcome: msg.outcome
            };
            self.seals.set(msg.sealId, updated);
        }

        cashback(ctx.sender);
    }

    // Get seal by ID
    get fun getSeal(sealId: Int): PredictionSeal? {
        return self.seals.get(sealId);
    }

    // Get total seal count
    get fun sealCount(): Int {
        return self.sealCount;
    }

    // Verify a seal hash matches
    get fun verifySeal(sealId: Int, hash: Int): Bool {
        let seal = self.seals.get(sealId);
        if (seal == null) {
            return false;
        }
        return seal!!.hash == hash;
    }
}
`.trim();
}

// Types are already exported at declaration
