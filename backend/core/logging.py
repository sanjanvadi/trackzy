import logging
import sys
from core.config import IS_PRODUCTION

LOG_LEVEL  = logging.WARNING if IS_PRODUCTION else logging.INFO
LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"

logging.basicConfig(stream=sys.stdout, level=LOG_LEVEL, format=LOG_FORMAT)

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
