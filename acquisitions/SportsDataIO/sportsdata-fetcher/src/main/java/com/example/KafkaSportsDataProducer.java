package com.example;

import java.util.UUID;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;

public class KafkaSportsDataProducer {

    private static final String TOPIC = "sports-data-topic"; // Define the Kafka topic

    //TODO Will need to store this in safe an encrypted location
    private static final String API_KEY = "";
    
    // The endpoint you want to fetch data from, for example: NFL players
    private static final String API_URL = "https://api.sportsdata.io/v3/nfl/scores/json/Players?key=" + API_KEY;

    public static void main(String[] args) throws Exception {
        // Step 1: Create the Kafka producer
        KafkaProducer<String, String> producer = KafkaProducerConfig.createKafkaProducer();

        // Step 2: Fetch data from SportsData.io API
        String jsonResponse = fetchSportsData();

        // Step 3: Structure Data (TODO: Discuss)

        // Step 4: Send the JSON data to Kafka
        if (jsonResponse != null) {
            ProducerRecord<String, String> record = new ProducerRecord<>(TOPIC, UUID.randomUUID().toString(), jsonResponse);

            // Send the record to Kafka
            producer.send(record, (metadata, exception) -> {
                if (exception != null) {
                    System.err.println("Failed to send message: " + exception.getMessage());
                } else {
                    System.out.println("Message sent successfully to " + metadata.topic() + " at offset " + metadata.offset());
                }
            });

            // Flush and close the producer
            producer.flush();
            producer.close();
        }
    }

    // Method to fetch data from the API
    private static String fetchSportsData() throws IOException, InterruptedException {
        // Create an HttpClient instance
        HttpClient client = HttpClient.newHttpClient();
        
        // Create a GET request
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .GET()
                .build();
        
        // Send the request and get the response
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        // Check the response status code (200 = OK)
        if (response.statusCode() == 200) {
            System.out.println("Data fetched successfully!");
            return response.body();  // Return the JSON response body
        } else {
            System.out.println("Failed to fetch data. HTTP Status Code: " + response.statusCode());
            return null;
        }
    }
}
