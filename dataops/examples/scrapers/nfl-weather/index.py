import asyncio
import json
from asyncio import timeout

from nodriver import start, cdp, loop
import urllib.robotparser


import urllib3
import uuid
import ssl
from confluent_kafka import SerializingProducer
from confluent_kafka.schema_registry import SchemaRegistryClient, RegisteredSchema
from confluent_kafka.schema_registry.avro import AvroSerializer
import fastavro


import requests

from tab import TabRequestResponse

# TODO: don't do this in production
old_session_init = requests.Session.__init__
def no_ssl_verify_init(self, *k, **kw):
    old_session_init(self, *k, **kw)
    self.verify = False
requests.Session.__init__ = no_ssl_verify_init
requests.urllib3.disable_warnings()

SITE = "https://www.nflweather.com"
ROBOTS_URL = f"{SITE}/robots.txt"


def delivery_report(errmsg, msg):
    if errmsg is not None:
        print("Delivery failed for Message: {} : {}".format(msg.key(), errmsg))
        return
    print('Message: {} successfully produced to Topic: {} Partition: [{}] at offset {}'.format(msg.key(), msg.topic(), msg.partition(), msg.offset()))


shared_url = None
shared_request = None
shared_response = None

async def request_handler(event: cdp.network.ResponseReceived):
    """
    
    :param event:
    :return:
    """
    # print(event.response)
    pass


async def request_handler(event: cdp.network.RequestWillBeSent):
    shared_request = event.request
    print(event.request)

async def crawl(producer, schema):
    # We RESPECT robots.txt
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(ROBOTS_URL)
    rp.read()

    # Start the browser
    browser = await start()
    # Use helper class wrapper we wrote to track request and responses
    tab = TabRequestResponse(browser.main_tab)

    # Start on the first page of 2024
    req, resp, page = await tab.goto(f'{SITE}/week/2024/hall-of-fame-weekend')

    # Wait for the element with the class 'game-box'
    try:
        await page.wait_for(selector='div.game-box', timeout=10)  # 10 seconds timeout
    except asyncio.TimeoutError:
        print("Element 'game-box' not found within the timeout.")
        return  # Exit the function early if the element is not found

    # Select all <div> elements with the class 'game-box'
    game_boxes = await page.select_all("div.game-box")

    entities = []

    # loop through every NFL game
    for box in game_boxes:

        # Try to select 'div.game-kickoff-status' within each box
        kickoff_status = await box.query_selector('div.game-kickoff-status')
        teams = await box.query_selector_all('div.team-game-box')
        team_parts = teams[0].text_all.strip().split(" ")
        team_1_name = team_parts[0]
        team_1_score = team_parts[1]
        team_parts = teams[1].text_all.strip().split(" ")
        team_2_name = team_parts[1]
        team_2_score = team_parts[0]
        weather_1 = await box.query_selector("div[class*=\\#\\<WeatherReport]")
        weather_2 = await box.query_selector("div[class*=\\#\\<WeatherReport] + div")

        # Create a unique ID to let dataops team know that all the entities are
        # related to the same event
        group_by_id = f"{uuid.uuid4()}"

        # build the entities by hand
        # in the Typescript example, we used the generated interfaces instead
        # that allowed us to have our IDE validate and hint data we tried to
        # assign prior to runtime
        #
        # building a dict/json object by hand can be easier, but we won't know
        # if the data is valid until runtime
        e = [{
            "type": 'DATE' ,
            "value": kickoff_status.text.strip(),
            "confidence": 1,
            "metadata": {
                "desc": "Date and time of kickoff",
                "group_by": group_by_id
            }
        },
        {
            "type": 'ORGANIZATION' ,
            "value": team_1_name,
            "confidence": 1,
            "metadata": {
                "desc": "Name of the away team",
                "group_by": group_by_id

            }
        },
        {
            "type":'ORGANIZATION' ,
            "value": team_2_name,
            "confidence": 1,
            "metadata": {
                "desc": "Name of the home team",
                "group_by": group_by_id

            }
        },
        {
            "type": 'QUANTITY' ,
            "value": team_1_score,
            "confidence": 1,
            "metadata": {
                "desc": "Score of the away team",
                "group_by": group_by_id

            }
        },
        {
            "type": 'QUANTITY' ,
            "value": team_2_score,
            "confidence": 1,
            "metadata": {
                "desc": "Score of the home team",
                "group_by": group_by_id

            }
        },
        {
            "type": 'OTHER' ,
            "value": f"{weather_1.text_all.strip()} {weather_2.text_all.strip()}",
            "confidence": 1,
            "metadata": {
                "desc": "Score of the home team",
                "group_by": group_by_id

            }
        }
        ]
        
        # add the grouped entities to other entities we'll submit
        entities.extend(e)

    # prepare the resposne
    page_data: str = await page.get_content()

    crawl_response = {
        "completed_timestamp": int(resp.response_time),
        "jobRequest": None,
                "sentRequest": {
            "http_method": req.method,
            "uri": req.url,
            "http_version": "",
            "headers": req.headers,
            "body": req.post_data
        },
                "response": {
            "http_status_code": resp.status,
            "http_status_message": resp.status_text,
            "uri": resp.url,
            "http_version": "",
            "headers": resp.headers,
            "body": page_data.encode('utf-8')
        },
        "entities": entities
    }


    # Simple example of clicking a button to show the next page
    next_btn = await page.select('div[data-navigate="next"][title="Next Week"]')
    await next_btn.click()
    # sleep so you can see the browser window change
    await asyncio.sleep(5)
    # TODO: now scrape this page... and loop until the button is no longer present
    await page.close()

    # if the data doesn't doesn't match the schema, the producer will throw an error
    # because the producer is validating the schema on the server side also
    # so even if you didn't use a serializer, you'd still get validation errors
    # you could also use the `fastavro.validate` function to validate the data
    # fastavro.validate(crawl_response, schema)
    producer.produce(topic='crawl-response', value=crawl_response, on_delivery=delivery_report)
    producer.flush()


async def main():

    # Connect to Kafka Schema Registry
    # We will use this to download the most current schema for the CrawlResponse
    schema_registry_conf = {
        'url': "https://localhost:8085",
        "basic.auth.user.info": "superUser:superUser",
    }
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)
    # Get the latest data schema for the CrawlResponse 
    # You could also get this by topic name
    crawl_schema = schema_registry_client.get_latest_version("crawl.CrawlResponse")

    # Build the data serializer (raw data sent over the wire - Avro)
    value_avro_serializer = AvroSerializer(
        schema_registry_client,
        schema_str = crawl_schema.schema.schema_str,
        conf={'auto.register.schemas': False}
    )

    # Connect to Kafka, and tell it we are a producer
    # e.g. going to publish data into the 'crawl-response' topic
    producer = SerializingProducer({
        # server to send data to
        'bootstrap.servers': 'kafka:12091',
        # unique client id for this producer
        'client.id': f'nfl-weather-{uuid.uuid4()}',
        # the worker that converts our JSON or dict into bytes
        'value.serializer': value_avro_serializer,
    })

    # go scrape the data
    await crawl(producer, json.loads(crawl_schema.schema.schema_str))






if __name__ == '__main__':

    # since asyncio.run never worked (for me)
    loop().run_until_complete(main())