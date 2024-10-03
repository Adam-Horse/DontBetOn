from nodriver.core.tab import Tab
from nodriver.cdp.network import ResponseReceived, RequestWillBeSent, Request, RequestId, Response
from nodriver.cdp.page import LifecycleEvent, FrameNavigated

from typing import Optional, Tuple, Dict
import asyncio


class TabRequestResponse:

    def __init__(self, browser_tab: Tab):
        self.tab = browser_tab
        self._response_event = asyncio.Event()
        self.tab.add_handler(RequestWillBeSent, self._handle_request)
        self.tab.add_handler(ResponseReceived, self._handle_response)
        self.tab.add_handler(FrameNavigated, self._handle_navigation)

        self.tab.add_handler(LifecycleEvent, self._handle_lifecycle_event)


        self._requested_url: Optional[str] = None
        self._requested_id: Optional[RequestId] = None


        self.requests: Dict[str, Request] = {}
        self.responses: Dict[str, Response] = {}

    async def _handle_lifecycle_event(self, event: LifecycleEvent):
        """
        Handles lifecycle events like page load, DOMContentLoaded, and init (beforeunload).

        :param event:
        :return:
        """
        print(event)

    async def _handle_navigation(self, event: FrameNavigated):
        print(event)

    async def _handle_request(self, event: RequestWillBeSent):
        """
        Intercepts all HTTP request before sent and saves them to history

        :param event:
        :return:
        """

        # add to request history
        self.requests[event.request_id] = event.request

        # check if this is our initial request
        if event.document_url == self._requested_url:
            # set id so we can lookup response
            self._requested_id = event.request_id
            # clear event, and only set when response received
            self._response_event.clear()


    async def _handle_response(self, event: ResponseReceived):
        if event.request_id not in self.responses:
            self.responses[event.request_id] = event.response

        if event.request_id == self._requested_id:
            self._response_event.set()

    async def goto(self, url: str) -> Tuple[Request, Response, Tab]:
        """
        Navigate to URL using GET request

        :param url:
        :return: Page loaded
        """
        self._requested_url = url
        await self.tab.get(url)
        await self._response_event.wait()

        return self.requests[self._requested_id], self.responses[self._requested_id], self.tab

