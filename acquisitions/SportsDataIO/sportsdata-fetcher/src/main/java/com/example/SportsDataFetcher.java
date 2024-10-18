package com.example;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class SportsDataFetcher {

    //TODO Will need to store this in safe an encrypted location
    private static final String API_KEY = "";
    
    // The endpoint you want to fetch data from, for example: NFL players
    private static final String API_URL = "https://api.sportsdata.io/v3/nfl/scores/json/Players?key=" + API_KEY;

    public static void main(String[] args) {
        try {
            // Fetch data from SportsData.io API
            String jsonResponse = fetchSportsData();

            // Parse and print the response
            if (jsonResponse != null) {
                //System.out.println(jsonResponse);
                parseAndDisplayResponse(jsonResponse);
                prettyPrintJson(jsonResponse);
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
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

    // Method to parse the JSON response and print the data
    private static void parseAndDisplayResponse(String jsonResponse) throws IOException {
        // Create an ObjectMapper instance
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Parse the JSON into a JsonNode tree
        JsonNode rootNode = objectMapper.readTree(jsonResponse);

        if (rootNode.isArray() && rootNode.size() > 0) {
            System.out.println("Displaying information for the first 5 players:");
            for (int i = 0; i < Math.min(5, rootNode.size()); i++) {  // Loop through the first 5 players or less if there are fewer than 5 players
                JsonNode player = rootNode.get(i);
                System.out.println("Player " + (i + 1) + " Info:");
                System.out.println("ID: " + player.get("PlayerID").asText());
                System.out.println("Name: " + player.get("FirstName").asText() + " " + player.get("LastName").asText());
                System.out.println("Team: " + player.get("Team").asText());
                System.out.println("-----------------------------");
            }
        } else {
            System.out.println("No players found.");
        }
    }

    // Method to pretty print the JSON response
    private static void prettyPrintJson(String jsonResponse) throws IOException {
        // Create an ObjectMapper instance
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Parse the JSON into a JsonNode tree
        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        
        // Pretty print the first 2 players (or fewer if not available)
        if (rootNode.isArray() && rootNode.size() > 0) {
            System.out.println("Pretty Printed JSON for First 2 Players:");
            for (int i = 0; i < Math.min(2, rootNode.size()); i++) {
                JsonNode player = rootNode.get(i);
                String prettyPlayerJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(player);
                System.out.println("Player " + (i + 1) + ":");
                System.out.println(prettyPlayerJson);
                System.out.println("-----------------------------");
            }
        } else {
            System.out.println("No players found.");
        }
    }
}