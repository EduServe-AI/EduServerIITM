export const populateEmbeddingsIncremental = async () => {
  console.log("Starting INCREMENTAL sync...");
};

if (require.main === module) {
  populateEmbeddingsIncremental().catch(console.error);
}
