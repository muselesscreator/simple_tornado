import tornado
import tornado.gen
import tornado.websocket

class BaseSocket(tornado.websocket.WebSocketHandler):
    def __init__(self, *args, **kwds):
        super(BaseSocket, self).__init__(*args, **kwds)
        self._uri = None
        self._remote_ip = None

    def on_message(self, data):
        msg = tornado.escape.json_decode(data)
        self._handle_message(msg)

    def open(self):
        super(BaseSocket, self).open()
        self._remote_ip = self.request.remote_ip
        self._uri = self.request.uri

    def _handle_message(self, msg):
        pass

    def send_msg(self, msg):
        data = tornado.escape.json_encode(msg)
        try:
            self.write_message(data)
        except WebSocketClosedError:
            print ("Attempt to send data on a closed websocket (%s: %s)" % 
                    (self._remote_ip, self._uri))
