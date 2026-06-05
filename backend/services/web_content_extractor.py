import requests
import trafilatura


def extract_article_content(url: str) -> str:
    """
    Download and extract clean article text
    from a medical website.
    """

    try:

        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": (
                    "Mozilla/5.0"
                )
            }
        )

        if response.status_code != 200:
            return ""

        downloaded = response.text

        extracted = trafilatura.extract(
            downloaded
        )

        return extracted or ""

    except Exception as e:

        print(
            f"Content Extraction Error: {e}"
        )

        return ""