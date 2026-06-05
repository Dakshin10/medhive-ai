from duckduckgo_search import DDGS

from services.web_content_extractor import (
    extract_article_content
)


TRUSTED_DOMAINS = [
    "who.int",
    "cdc.gov",
    "mayoclinic.org",
    "medlineplus.gov",
    "nhs.uk"
]


def search_medical_web(
    query: str,
    max_results: int = 5
):

    results = []

    with DDGS() as ddgs:

        search_results = ddgs.text(
            query,
            max_results=max_results * 2
        )

        for item in search_results:

            url = item.get(
                "href",
                ""
            )

            if not any(
                domain in url
                for domain in TRUSTED_DOMAINS
            ):
                continue

            article_content = (
                extract_article_content(
                    url
                )
            )

            results.append(
                {
                    "title": item.get(
                        "title",
                        ""
                    ),
                    "url": url,
                    "snippet": item.get(
                        "body",
                        ""
                    ),
                    "content": (
                        article_content[:4000]
                    )
                }
            )

            if len(results) >= max_results:
                break

    return results