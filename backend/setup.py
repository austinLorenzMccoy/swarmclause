from setuptools import find_packages, setup

install_requires = [
    "fastapi==0.110.0",
    "uvicorn[standard]==0.27.1",
    "sqlalchemy==2.0.25",
    "pydantic==2.6.3",
    "pydantic-settings==2.1.0",
    "python-dotenv==1.0.1",
    "httpx==0.25.2",
]

extras_require = {
    "test": [
        "pytest==8.1.1",
        "pytest-cov==4.1.0",
        "requests==2.32.3",
    ]
}

setup(
    name="swarmclause-backend",
    version="0.1.0",
    description="FastAPI backend for the SwarmClause negotiation platform",
    packages=find_packages(include=["app", "app.*"]),
    install_requires=install_requires,
    extras_require=extras_require,
)
