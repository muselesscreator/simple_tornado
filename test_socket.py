import base_socket

class TestSocket(base_socket.BaseSocket):
    def _handle_message(self, msg):
        if msg == {}:
            return
        if 'text' in msg:
            self.send_msg({'text': 'I got %s' % msg['text']})
