import Hero, { Resource } from '@ulixee/hero-playground';
import { Kafka, Producer, logLevel } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { v4 as uuidv4 } from 'uuid';
import robotsParser from 'robots-parser';
import fs from 'fs';
import { Crawl, Entity } from './schemas/avro.interfaces';
import { Agent } from 'https';

const SITE = 'https://www.pro-football-reference.com';

/**
 * Prepares the strongly-typed CrawlResponse based on the scraped resources.
 * This method formats the HTTP request and response into a structure compatible
 * with our Avro schemas.
 * 
 * @param resources - Resource object containing the HTTP request and response data.
 * @returns A CrawlResponse object with the request, response, and other details.
 */
async function prepareResponseStronglyTyped(resources: Resource): Promise<Crawl.CrawlResponse> {
    // Prepare HTTP request object
    const req: Crawl.HttpRequest = {
        http_method: resources.request.method,
        uri: resources.url,
        http_version: '',
        headers: resources.request.headers,
        body: null,
    };

    // Prepare HTTP response object
    const resp: Crawl.HttpResponse = {
        http_status_code: resources.response.statusCode,
        http_status_message: resources.response.statusMessage ?? '',
        uri: resources.response.url,
        http_version: '',
        headers: resources.response.headers,
        body: await resources.response.buffer,
    };

    // Prepare the full CrawlResponse object
    const crawlResponse: Crawl.CrawlResponse = {
        completed_timestamp: Date.now(),
        jobRequest: null,
        sentRequest: req,
        response: resp,
        entities: null,
    };

    return crawlResponse;
}

/**
 * Scrapes active NFL players from the Pro Football Reference website.
 * 
 * It respects robots.txt for ethical scraping and only scrapes allowed pages.
 * The method scrapes all active players whose names are listed on the website.
 * 
 * @param producer - Kafka producer used to send messages.
 * @param registry - Schema registry to encode Avro messages.
 * @param schemaId - The schema ID used for encoding Avro messages.
 */
async function getActivePlayers(producer: Producer, registry: SchemaRegistry, schemaId: number) {
    // Load and parse robots.txt to respect scraping rules
    const robotsFile = fs.readFileSync('resources/robots.txt', 'utf8');
    const robotsTxt = robotsParser(`${SITE}/robots.txt`, robotsFile);

    // Initialize a headless browser instance using Ulixee Hero
    const heroBrowser = new Hero();

    // Loop through all the letters of the alphabet to scrape player names
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (const letter of alphabet) {
        const url = `${SITE}/players/${letter}/`;

        // Check if the page is disallowed by robots.txt
        if (robotsTxt.isDisallowed(url)) {
            console.log(`Disallowed: ${url}`);
            continue; // Skip to the next letter
        }

        // Navigate to the page and wait for it to render
        const resources = await heroBrowser.goto(url);
        await heroBrowser.waitForPaintingStable(); // Wait for the page to fully stabilize

        // Prepare a response with HTTP request/response data
        const topicResponse = await prepareResponseStronglyTyped(resources);
        topicResponse.entities = [];

        // Scrape all active players (bolded player names)
        const anchors = await heroBrowser.xpathSelectorAll('.//p/b/a');

        // Create entity objects for each player and add to the response
        for (const anchor of anchors) {
            const playerName = await anchor.textContent;
            let playerLink = await anchor.getAttribute('href') ?? '';

            if (!playerName) continue; // Skip if player name is invalid

            console.log(`Found player: ${playerName} with link: ${playerLink}`);

            const entity: Entity.Entity = {
                type: { 'entity.CommonEntityType': 'PERSON' },
                value: playerName,
                confidence: 1,
                metadata: { player_link: playerLink },
            };

            topicResponse.entities.push(entity); // Add player entity to response
        }

        // Encode the message using the schema registry
        const encodedMessage = await registry.encode(schemaId, topicResponse);

        // Send the encoded message to Kafka
        await producer.send({
            topic: 'crawl-response',
            messages: [{ value: encodedMessage }],
            timeout: 3000, // Timeout after 3 seconds if unable to send
        });
    }

    // Close the browser instance
    await heroBrowser.close();
}

/**
 * Main function to run the crawler.
 * It initializes Kafka and the schema registry, then starts scraping.
 */
async function main() {
    // Initialize Kafka client and connect to brokers
    const kafka = new Kafka({
        clientId: `nfl-active-player-agent-${uuidv4()}`, // Unique client ID for each instance
        brokers: ['kafka1:12091', 'kafka2:12092'], // Kafka brokers to connect to
        connectionTimeout: 3000, // 3-second timeout for connection attempts
        logLevel: logLevel.INFO, // Log level for Kafka messages
    });

    const producer = kafka.producer();
    producer.logger().setLogLevel(logLevel.INFO); // Set producer log level
    await producer.connect(); // Connect the producer to Kafka brokers

    // Initialize schema registry to encode/decode Avro messages
    const agent = new Agent({ keepAlive: true, rejectUnauthorized: false }); // Insecure agent for local testing
    const registry = new SchemaRegistry({
        host: 'https://localhost:8085', // Schema registry URL
        auth: { username: 'superUser', password: 'superUser' }, // Authentication
        agent: agent,
    });

    // Fetch the latest schema ID for the 'CrawlResponse' Avro schema
    const schemaId = await registry.getLatestSchemaId('crawl.CrawlResponse');

    // Start scraping active players and send the data to Kafka
    await getActivePlayers(producer, registry, schemaId);

    // Disconnect the Kafka producer after completion
    await producer.disconnect();
}

// Start the crawler
main();
