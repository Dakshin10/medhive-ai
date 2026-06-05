import os

from sentence_transformers import SentenceTransformer

from rag.vector_store import collection

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

DATA_FOLDER = "data/medical_docs"

for file in os.listdir(DATA_FOLDER):

    path = os.path.join(
        DATA_FOLDER,
        file
    )

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:

        content = f.read()

    embedding = model.encode(
        content
    ).tolist()

    collection.add(
        ids=[file],
        documents=[content],
        embeddings=[embedding]
    )

print("Medical Knowledge Loaded")