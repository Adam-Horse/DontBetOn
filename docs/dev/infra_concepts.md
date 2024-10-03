# Development Documentation


- [Quick Start](##Quick-Start)
- [Concepts for Acquisition Team](##Data-Acquisition-Concepts)
- [Concepts for Engagement Team](##Engagement-Team-Concepts)

## Quick Start

This section provides examples of code used to interact with the DataOps infrastructure.

### Data Acquisition or Consumer Agents

Example using Node.js and TypeScript:

```typescript
// Initialize Kafka client and connect to brokers
const kafka = new Kafka({
    clientId: `nfl-active-player-agent-${uuidv4()}`, // Unique client ID
    brokers: ['kafka1:12091', 'kafka2:12092'] // Kafka brokers' addresses
});

// Connect to the Schema Registry to work with the latest schema versions
const registry = new SchemaRegistry({
    host: 'https://localhost:8085', // Schema Registry address
    auth: { username: USERNAME, password: PASSWORD }, // Schema Registry credentials
});

// Get the latest schema ID for the 'CrawlResponse'
const schemaId = await registry.getLatestSchemaId('crawl.CrawlResponse');

// Connect to Kafka as a producer
const producer = kafka.producer();

// Scrape data
let data = await myCoolNFLScraper("https://free-nfl-data-scraping.com");

let encodedMessage = null;
try {
    // Encode the message using the schema registry
    encodedMessage = await registry.encode(schemaId, data);
} catch (e) {
    // Log any schema compliance errors
    console.log(e);
}

// Send the encoded message to the 'crawl-response' topic
if (encodedMessage) {
    await producer.send({
        topic: 'crawl-response',
        messages: [{ value: encodedMessage }],
    });
}

// Disconnect the Kafka producer when done
await producer.disconnect();
```

### Front-End Applications 

(TODO: Add GraphQL example)

## Data Acquisition Concepts

To create data acquisition agents, there are three key concepts to understand:

1. [Producer and Consumer Model](#producer-and-consumer-model)
2. [Kafka Topics](#kafka-topics)
3. [Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html)

### Producer and Consumer Model

Think of a moving conveyor belt: producers put objects on it, and consumers take them off. In our system:

- **Kafka** is the conveyor belt.
- **Data records** are the objects.
- **Data agents** (producers and consumers) interact with these records.

Examples of Data Agent Producers:
- Web crawlers
- RSS feeds
- API feeds
- Server-Sent Events

Examples of Data Agent Consumers:
- Link parsers
- Entity extractors
- Sentiment analyzers
- Data transformers

### Kafka Topics

Topics are like separate conveyor belts for different types of data. 

They help producers and consumers focus on specific tasks. Imagine a factory with one conveyor belt for painting doors and another for assembling seats. Keeping tasks separated improves efficiency.

Similarly, Kafka Topics allow producers and consumers to handle specific types of data without confusion.

Example topics:
- **Crawl Response**: Web crawler data
- **RSS Feed**: XML from RSS feeds
- **API Feed**: JSON from an API

You can also be more specific:
- **Twitter Feed**: JSON from Twitter API
- **ProFootball Reference**: Raw HTML from the website

More about Kafka Topics: [Kafka Introduction](https://kafka.apache.org/intro)

### Schema Registry

Schemas ensure that both producers and consumers know the structure of the data they are working with. In Kafka, we use the [Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html) to manage these schemas. Avro is the format used to define schemas.

### How to Read Avro IDL

- **Fields**: Defined as `type fieldName;` (e.g., `string uri;`)
- **Primitive types**: Common types include `string`, `int`, `long`, `bytes`, etc.
- **Complex types**: Can be collections like `array<type>` or `map<type>` (e.g., `map<string> headers;`)
- **Unions**: Defined using `union {type1, type2}`, meaning the field can be either type.
- **Optional fields**: Indicated by `?` after the type, meaning the field can be `null` (e.g., `bytes? body;`).
- **Records**: Structured objects that group fields together (e.g., `record HttpResponse {...}`)
- **Imports**: Used to include definitions from other IDL files (e.g., `import idl "filename.avdl";`)

For example, here’s an Avro schema for an `HttpResponse`:

```avdl
/** A structured objects representing a HTTP response */
record HttpResponse {
    /** HTTP status code from server (e.g. 200, 404, 500, etc.) */
    int http_status_code;
    /** HTTP status message from server (e.g. OK, Not Found, Internal Server Error, etc.) */
    string http_status_message;

    /** URL of the final resource */
    string uri;
    /** Version of the HTTP protocol used */
    string http_version;
    /** HTTP Headers returned by the server */
    map<union {string, array<string>}> headers;
    /** Raw bytes of the body response  */
    bytes? body;
}
```

Most of the fields in the schema are simple data types like `string` and `int`. However, fields can also be more complex. For example, the `headers` field is a map (like a dictionary) where each key is a string, but the values can be either a single string or an array of strings in this example.

Take note of the `?` in the `body` field. This means that the field is optional, meaning it can either have a value or be `null` (empty).

Schemas can reference other schemas. For example, `CrawlResponse` references `HttpResponse`:


```avdl
import idl "crawlRequest.avdl";
import idl "../http/httpRequest.avdl";
import idl "../http/httpResponse.avdl";
import idl "../entities/entity.avdl";

// @convert
record CrawlResponse {
    /** Time crawl completed, unix timestamp in milliseconds */
    long completed_timestamp;
    /** Optional, original crawl request */
    CrawlRequest? jobRequest;

    /** Final request sent to server */
    HttpRequest sentRequest;
    /** 
     * Response received from server 
     * If null, represents a timeout error, failure to connect, etc.
     */
    HttpResponse? response;

    /** Entities extracted from response */
    union {null, array<entity.Entity>} entities;
}
```

## Engagement Team

Creating front-end applications requires understanding:

- GraphQL