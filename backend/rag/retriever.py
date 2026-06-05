from sentence_transformers import SentenceTransformer

from rag.vector_store import collection

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def retrieve(query):

    embedding = model.encode(
        query
    ).tolist()

    results = collection.query(
        query_embeddings=[embedding],
        n_results=3
    )

    return results["documents"][0]