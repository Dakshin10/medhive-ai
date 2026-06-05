import asyncio

from workflows.healthcare_coordinator import HealthcareCoordinator


async def main():

    coordinator = HealthcareCoordinator()

    result = await coordinator.analyze(
        """
        I have fever, headache and body pain for 3 days.
        """
    )

    print(result)


if __name__ == "__main__":
    asyncio.run(main())