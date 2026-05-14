import firebase_admin
import os
from firebase_admin import credentials
from core.config import GOOGLE_CREDENTIALS, ENV, FIREBASE_SERVICE_ACCOUNT

# Firestore is NOT used — Firebase is kept only for Auth token verification
# This lets us keep Google Sign-In without Firestore dependency
if ENV == "development":
    os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099"

if not firebase_admin._apps and ENV=="local":
    cred = credentials.Certificate(GOOGLE_CREDENTIALS)
    firebase_admin.initialize_app(cred)

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT)
    firebase_admin.initialize_app(cred)
