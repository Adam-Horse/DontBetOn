/* eslint-disable @typescript-eslint/no-namespace */

export type CrawlResponse = Crawl.CrawlResponse;

export namespace Crawl {
    export const CrawlMethodSchema = "{\"type\":\"enum\",\"name\":\"CrawlMethod\",\"symbols\":[\"URL\",\"INTERACT\"],\"default\":\"URL\"}";
    export const CrawlMethodName = "crawl.CrawlMethod";
    export type CrawlMethod = "URL" | "INTERACT";
    export const HttpRequestOptionsSchema = "{\"type\":\"record\",\"name\":\"HttpRequestOptions\",\"fields\":[{\"name\":\"http_method\",\"type\":\"string\",\"doc\":\"HTTP method used in the request\"},{\"name\":\"uri\",\"type\":\"string\"},{\"name\":\"http_version\",\"type\":\"string\"},{\"name\":\"headers\",\"type\":{\"type\":\"map\",\"values\":\"string\"}},{\"name\":\"body\",\"type\":[\"null\",\"bytes\"]}]}";
    export const HttpRequestOptionsName = "crawl.HttpRequestOptions";
    export interface HttpRequestOptions {
        /**
         * HTTP method used in the request
         */
        http_method: string;
        uri: string;
        http_version: string;
        headers: {
            [index: string]: string;
        };
        body: null | Buffer;
    }
    export const CrawlRequestSchema = "{\"type\":\"record\",\"name\":\"CrawlRequest\",\"fields\":[{\"name\":\"correlation_id\",\"type\":\"string\",\"doc\":\"UUID to correlate requests and responses\\n* used for tracking across topics.\"},{\"name\":\"created_timestamp\",\"type\":\"long\",\"doc\":\"Time crawl was queued, unix timestamp in milliseconds\"},{\"name\":\"uri\",\"type\":\"string\",\"doc\":\"URI to be crawled\"},{\"name\":\"crawl_method\",\"type\":[\"null\",{\"type\":\"enum\",\"name\":\"CrawlMethod\",\"symbols\":[\"URL\",\"INTERACT\"],\"default\":\"URL\"}],\"doc\":\"Optional interaction method used to navigate to URI\"},{\"name\":\"viewport_id\",\"type\":[\"null\",\"string\"],\"doc\":\"Optional id of viewport to execute request\"},{\"name\":\"options\",\"type\":[\"null\",{\"type\":\"record\",\"name\":\"HttpRequestOptions\",\"fields\":[{\"name\":\"http_method\",\"type\":\"string\",\"doc\":\"HTTP method used in the request\"},{\"name\":\"uri\",\"type\":\"string\"},{\"name\":\"http_version\",\"type\":\"string\"},{\"name\":\"headers\",\"type\":{\"type\":\"map\",\"values\":\"string\"}},{\"name\":\"body\",\"type\":[\"null\",\"bytes\"]}]}],\"doc\":\"Optional request params to be sent to server\"}]}";
    export const CrawlRequestName = "crawl.CrawlRequest";
    export interface CrawlRequest {
        /**
         * UUID to correlate requests and responses
         * * used for tracking across topics.
         */
        correlation_id: string;
        /**
         * Time crawl was queued, unix timestamp in milliseconds
         */
        created_timestamp: number;
        /**
         * URI to be crawled
         */
        uri: string;
        /**
         * Optional interaction method used to navigate to URI
         */
        crawl_method: null | Crawl.CrawlMethod;
        /**
         * Optional id of viewport to execute request
         */
        viewport_id: null | string;
        /**
         * Optional request params to be sent to server
         */
        options: null | Crawl.HttpRequestOptions;
    }
    export const HttpRequestSchema = "{\"type\":\"record\",\"name\":\"HttpRequest\",\"fields\":[{\"name\":\"http_method\",\"type\":\"string\",\"doc\":\"HTTP method used in the request\"},{\"name\":\"uri\",\"type\":\"string\"},{\"name\":\"http_version\",\"type\":\"string\"},{\"name\":\"headers\",\"type\":{\"type\":\"map\",\"values\":\"string\"}},{\"name\":\"body\",\"type\":[\"null\",\"bytes\"]}]}";
    export const HttpRequestName = "crawl.HttpRequest";
    export interface HttpRequest {
        /**
         * HTTP method used in the request
         */
        http_method: string;
        uri: string;
        http_version: string;
        headers: {
            [index: string]: string | string[];
        };
        body: null | Buffer;
    }
    export const HttpResponseSchema = "{\"type\":\"record\",\"name\":\"HttpResponse\",\"fields\":[{\"name\":\"http_status_code\",\"type\":\"int\"},{\"name\":\"http_status_message\",\"type\":\"string\"},{\"name\":\"uri\",\"type\":\"string\"},{\"name\":\"http_version\",\"type\":\"string\"},{\"name\":\"headers\",\"type\":{\"type\":\"map\",\"values\":\"string\"}},{\"name\":\"body\",\"type\":[\"null\",\"bytes\"]}]}";
    export const HttpResponseName = "crawl.HttpResponse";
    export interface HttpResponse {
        http_status_code: number;
        http_status_message?: string;
        uri: string;
        http_version: string | undefined;
        headers: {
            [index: string]: string | string[];
        };
        body: null | Buffer;
    }
    export const CrawlResponseSchema = "{\"type\":\"record\",\"name\":\"CrawlResponse\",\"namespace\":\"crawl\",\"fields\":[{\"name\":\"completed_timestamp\",\"type\":\"long\",\"doc\":\"Time crawl completed, unix timestamp in milliseconds\"},{\"name\":\"jobRequest\",\"type\":{\"type\":\"record\",\"name\":\"CrawlRequest\",\"fields\":[{\"name\":\"correlation_id\",\"type\":\"string\",\"doc\":\"UUID to correlate requests and responses\\n* used for tracking across topics.\"},{\"name\":\"created_timestamp\",\"type\":\"long\",\"doc\":\"Time crawl was queued, unix timestamp in milliseconds\"},{\"name\":\"uri\",\"type\":\"string\",\"doc\":\"URI to be crawled\"},{\"name\":\"crawl_method\",\"type\":[\"null\",{\"type\":\"enum\",\"name\":\"CrawlMethod\",\"symbols\":[\"URL\",\"INTERACT\"],\"default\":\"URL\"}],\"doc\":\"Optional interaction method used to navigate to URI\"},{\"name\":\"viewport_id\",\"type\":[\"null\",\"string\"],\"doc\":\"Optional id of viewport to execute request\"},{\"name\":\"options\",\"type\":[\"null\",{\"type\":\"record\",\"name\":\"HttpRequestOptions\",\"fields\":[{\"name\":\"http_method\",\"type\":\"string\",\"doc\":\"HTTP method used in the request\"},{\"name\":\"uri\",\"type\":\"string\"},{\"name\":\"http_version\",\"type\":\"string\"},{\"name\":\"headers\",\"type\":{\"type\":\"map\",\"values\":\"string\"}},{\"name\":\"body\",\"type\":[\"null\",\"bytes\"]}]}],\"doc\":\"Optional request params to be sent to server\"}]},\"doc\":\"Original crawl request\"},{\"name\":\"sentRequest\",\"type\":{\"type\":\"record\",\"name\":\"HttpRequest\",\"fields\":[{\"name\":\"http_method\",\"type\":\"string\",\"doc\":\"HTTP method used in the request\"},{\"name\":\"uri\",\"type\":\"string\"},{\"name\":\"http_version\",\"type\":\"string\"},{\"name\":\"headers\",\"type\":{\"type\":\"map\",\"values\":\"string\"}},{\"name\":\"body\",\"type\":[\"null\",\"bytes\"]}]},\"doc\":\"Final request sent to server\"},{\"name\":\"response\",\"type\":{\"type\":\"record\",\"name\":\"HttpResponse\",\"fields\":[{\"name\":\"http_status_code\",\"type\":\"int\"},{\"name\":\"http_status_message\",\"type\":\"string\"},{\"name\":\"uri\",\"type\":\"string\"},{\"name\":\"http_version\",\"type\":\"string\"},{\"name\":\"headers\",\"type\":{\"type\":\"map\",\"values\":\"string\"}},{\"name\":\"body\",\"type\":[\"null\",\"bytes\"]}]},\"doc\":\"Response received from server\"},{\"name\":\"entities\",\"type\":[\"null\",{\"type\":\"array\",\"items\":{\"type\":\"record\",\"name\":\"Entity\",\"namespace\":\"entity\",\"fields\":[{\"name\":\"type\",\"type\":[{\"type\":\"enum\",\"name\":\"CommonEntityType\",\"symbols\":[\"PERSON\",\"LOCATION\",\"ORGANIZATION\",\"COMMERCIAL_ITEM\",\"EVENT\",\"DATE\",\"QUANTITY\",\"TITLE\",\"OTHER\"]},{\"type\":\"enum\",\"name\":\"PhysicalAttributeEntityType\",\"symbols\":[\"HEIGHT\",\"WEIGHT\",\"COLOR\",\"SIZE\",\"SHAPE\",\"SPEED\",\"AGE\",\"MATERIAL\",\"TEMPERATURE\",\"VOLUME\",\"DISTANCE\",\"CAPACITY\",\"DURABILITY\",\"TEXTURE\",\"OTHER_PHYSICAL_ATTRIBUTE\"]}],\"doc\":\"type of entity\"},{\"name\":\"value\",\"type\":\"string\",\"doc\":\"Value associated with the entity\"},{\"name\":\"confidence\",\"type\":[\"null\",\"float\"],\"doc\":\"Confidence score for the entity, 1 = 100%, .5 = 50%, etc.\"},{\"name\":\"metadata\",\"type\":[\"null\",{\"type\":\"map\",\"values\":\"string\"}],\"doc\":\"Any key-value pairs that may be useful to understand or provide context\"}]}}],\"doc\":\"Entities extracted from response\"}]}";
    export const CrawlResponseName = "crawl.CrawlResponse";
    export interface CrawlResponse {
        /**
         * Time crawl completed, unix timestamp in milliseconds
         */
        completed_timestamp: number;
        /**
         * Original crawl request
         */
        jobRequest: Crawl.CrawlRequest | null;
        /**
         * Final request sent to server
         */
        sentRequest: Crawl.HttpRequest;
        /**
         * Response received from server
         */
        response: Crawl.HttpResponse;
        /**
         * Entities extracted from response
         */
        entities: null | Entity.Entity[];
    }
}

export namespace Entity {
    export const CommonEntityTypeSchema = "{\"type\":\"enum\",\"name\":\"CommonEntityType\",\"symbols\":[\"PERSON\",\"LOCATION\",\"ORGANIZATION\",\"COMMERCIAL_ITEM\",\"EVENT\",\"DATE\",\"QUANTITY\",\"TITLE\",\"OTHER\"]}";
    export const CommonEntityTypeName = "entity.CommonEntityType";
    export type CommonEntityType = "PERSON" | "LOCATION" | "ORGANIZATION" | "COMMERCIAL_ITEM" | "EVENT" | "DATE" | "QUANTITY" | "TITLE" | "OTHER";
    export const PhysicalAttributeEntityTypeSchema = "{\"type\":\"enum\",\"name\":\"PhysicalAttributeEntityType\",\"symbols\":[\"HEIGHT\",\"WEIGHT\",\"COLOR\",\"SIZE\",\"SHAPE\",\"SPEED\",\"AGE\",\"MATERIAL\",\"TEMPERATURE\",\"VOLUME\",\"DISTANCE\",\"CAPACITY\",\"DURABILITY\",\"TEXTURE\",\"OTHER_PHYSICAL_ATTRIBUTE\"]}";
    export const PhysicalAttributeEntityTypeName = "entity.PhysicalAttributeEntityType";
    export type PhysicalAttributeEntityType = "HEIGHT" | "WEIGHT" | "COLOR" | "SIZE" | "SHAPE" | "SPEED" | "AGE" | "MATERIAL" | "TEMPERATURE" | "VOLUME" | "DISTANCE" | "CAPACITY" | "DURABILITY" | "TEXTURE" | "OTHER_PHYSICAL_ATTRIBUTE";
    export const EntitySchema = "{\"type\":\"record\",\"name\":\"Entity\",\"namespace\":\"entity\",\"fields\":[{\"name\":\"type\",\"type\":[{\"type\":\"enum\",\"name\":\"CommonEntityType\",\"symbols\":[\"PERSON\",\"LOCATION\",\"ORGANIZATION\",\"COMMERCIAL_ITEM\",\"EVENT\",\"DATE\",\"QUANTITY\",\"TITLE\",\"OTHER\"]},{\"type\":\"enum\",\"name\":\"PhysicalAttributeEntityType\",\"symbols\":[\"HEIGHT\",\"WEIGHT\",\"COLOR\",\"SIZE\",\"SHAPE\",\"SPEED\",\"AGE\",\"MATERIAL\",\"TEMPERATURE\",\"VOLUME\",\"DISTANCE\",\"CAPACITY\",\"DURABILITY\",\"TEXTURE\",\"OTHER_PHYSICAL_ATTRIBUTE\"]}],\"doc\":\"type of entity\"},{\"name\":\"value\",\"type\":\"string\",\"doc\":\"Value associated with the entity\"},{\"name\":\"confidence\",\"type\":[\"null\",\"float\"],\"doc\":\"Confidence score for the entity, 1 = 100%, .5 = 50%, etc.\"},{\"name\":\"metadata\",\"type\":[\"null\",{\"type\":\"map\",\"values\":\"string\"}],\"doc\":\"Any key-value pairs that may be useful to understand or provide context\"}]}";
    export const EntityName = "entity.Entity";
    export interface Entity {
        /**
         * type of entity
         */
        type: Entity.CommonEntityType | Entity.PhysicalAttributeEntityType | {
            [index: string]: string;
        };
        /**
         * Value associated with the entity
         */
        value: string;
        /**
         * Confidence score for the entity, 1 = 100%, .5 = 50%, etc.
         */
        confidence: null | number;
        /**
         * Any key-value pairs that may be useful to understand or provide context
         */
        metadata: null | {
            [index: string]: string;
        };
    }
}
