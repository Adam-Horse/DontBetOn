# Data Acquisition Examples

Two example agents (in different languages) demonstrate how to collect data and send it to Kafka for processing.

## NFL Active Players

A nodejs written in Typescript that collects a list of all active players from the NFL.

Features:
- Respects robots.txt
- Code generated TypeScript interfaces from Avro IDL
- Uses Kafka Schema Registry to encode data

## NFL Weather

A simple Python script that collects weather from game days.

Features:
- Loosely-typed data model (e.g. no type checking)
- How to use `undetected_chromedriver` (respect robots.txt)
- Clicking interactions vs just navigating
