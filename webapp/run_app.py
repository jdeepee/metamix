from metamix.application import create_app
import os

# Set config Object based on Ennv
if os.environ.get('METAMIX_ENV') == "production":
    config = "metamix.config.Production"

elif os.environ.get('METAMIX_ENV') == "development":
    config = "metamix.config.Development"

elif os.environ.get('METAMIX_ENV') == "test":
    config = "metamix.config.Test"

print "Running app with config: " + config

# Create application using selected config
app = create_app(config)

if __name__ == "__main__":
    app.run()
