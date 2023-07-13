from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline

# VADER scores
ANALYSER = SentimentIntensityAnalyzer()
# To classify emotion
EMOTION_CLASSIFIER = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True,
)
# For toxicity
TOXIC_CLASSIFIER = pipeline(
    "text-classification", model="martin-ha/toxic-comment-model"
)
# General positive or negative
GENERAL_CLASSIFIER = pipeline(
    "text-classification", model="distilbert-base-uncased-finetuned-sst-2-english"
)
