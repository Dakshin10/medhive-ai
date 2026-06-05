from fastapi import FastAPI

from api.routes import router

app = FastAPI(
    title="MedHive AI",
    version="1.0.0"
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "message": "MedHive AI Running"
    }