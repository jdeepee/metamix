class MetaMixException(Exception):

    def __init__(self, message=None, status_code=400, payload=None):
        Exception.__init__(self)
        self.message = message
        self.status_code = status_code

        if self.status_code is not None:
            self.status_code = status_code

        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())

        if self.message is not None:
            rv['message'] = self.message

        return rv