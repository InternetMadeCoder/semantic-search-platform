from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    app_name: str = 'Semantic Search API'
    api_v1_prefix: str = '/api/v1'

    secret_key: str
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 60 * 24 * 30

    mongodb_uri: str
    mongodb_db: str = 'semantic_search_db'

    pinecone_api_key: str
    pinecone_index: str
    pinecone_cloud: str = 'aws'
    pinecone_region: str = 'us-east-1'
    pinecone_dimension: int = 384

    embedding_model: str = 'all-MiniLM-L6-v2'
    hf_api_key: str | None = None
    use_hf_inference: bool = False

    chunk_size_words: int = 380
    chunk_overlap_words: int = 60
    top_k: int = 5

    cors_origins: list[str] = ['*']

    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(',') if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
