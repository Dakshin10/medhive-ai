from services.report_parser import (
    extract_pdf_text
)


async def analyze_report(
    report_agent,
    pdf_path: str
):

    report_text = (
        extract_pdf_text(
            pdf_path
        )
    )

    result = await report_agent.run(
        task=report_text
    )

    return (
        result.messages[-1].content
    )