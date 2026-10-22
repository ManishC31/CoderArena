import "server-only";
import { Pinecone, type Index } from "@pinecone-database/pinecone";

// Metadata stored with each embedded chunk of a repository's code.
export type ChunkMetadata = {
  path: string;
  chunk: number;
  // The chunk's first 1,000 characters, sent to the model as context.
  content: string;
};

let index: Index<ChunkMetadata> | undefined;

// The index holding every repository's chunks (PINECONE_INDEX, 512 dimensions). Created on
// first use, so a missing PINECONE_API_KEY only fails the features that need it.
export function getCodeIndex() {
  return (index ??= new Pinecone({ apiKey: process.env.PINECONE_API_KEY! }).index<ChunkMetadata>({
    name: process.env.PINECONE_INDEX ?? "coderarena",
  }));
}

// Each repository's chunks live in their own namespace, so re-indexing can clear them first.
export function pineconeNamespace(repositoryId: string) {
  return `repo_${repositoryId}`;
}
