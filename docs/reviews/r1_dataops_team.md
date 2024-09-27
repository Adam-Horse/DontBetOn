# DataOps Team Review 1 Overview

We bridge data acquisition with user engagement.

## Goals

Support the Data Acquisition and Front-End teams to focus on their expertise:

- Data Acquisition handles collection, not structuring.
- Front-End gets the data they need, when they need it.

## Objectives

- Build a GraphQL API for front-end data access.
- Create an event platform for data acquisition with "fire and forget" capability.
- Develop a pipeline to structure and enrich data.

## Tech Stack & Standards

- GraphQL (Front-end API): Allows precise, fast queries without excessive DataOps effort.
- Kafka Streams (Event & Data Pipeline): Facilitates communication, data replay, and processing between agents.
- Prometheus (NoSQL): Stores processed data for future analytics and composite data creation.
- PostgresSQL: Long-term storage for structured data.
- Languages: Python (data processing agents), Typescript (GraphQL).

## Timeline

- Week 6
    -- Build initial GraphQL structure and present to the Front-End team.
    -- Develop initial Kafka topics for the Data Acquisition team.
    -- Set up infrastructure for data processing and storage.
- Week 7: 
    -- Review GraphQL data structure with the Front-End team and make necessary refinements.
    -- Develop Kafka topics for processing data.
    -- Build the first data processing agent (entity extractor).- Week 8
- Week 8:
    -- Expand data pipeline for data enrichment and event tagging.
    -- Begin developing a data validation framework for incoming data.
    -- Test end-to-end workflow from acquisition to the front-end API.
