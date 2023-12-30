import os
import logging
import sys

# import uuid
# import requests
import json

from preprocessor import preprocessing
from processor.nn_models import initializeModels

print("Initializing handler")

ANALYSER = None
EMOTION_CLASSIFIER = None
GENERAL_CLASSIFIER = None
TOXIC_CLASSIFIER = None
initialized = False


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

lambda_key = os.environ["LAMBDA_KEY"]

def analyze(event, context):

    print("Received event.")
    print(json.dumps(event, indent=2))

    if event["lambda_key"] != lambda_key:
        return {"statusCode": 401, "body": "Unauthorized"}

    global ANALYSER, EMOTION_CLASSIFIER, TOXIC_CLASSIFIER, GENERAL_CLASSIFIER, initialized
    if not initialized:
        print("Initializing models")
        (
            ANALYSER,
            EMOTION_CLASSIFIER,
            TOXIC_CLASSIFIER,
            GENERAL_CLASSIFIER,
        ) = initializeModels()
        initialized = True
        print("Models initialized")

    data = event["data"]

    originalData = data
    data = preprocessing.process_data(data)

    vader = ANALYSER.polarity_scores(data)
    emotions = EMOTION_CLASSIFIER(data)
    toxicity = TOXIC_CLASSIFIER(data)
    general = GENERAL_CLASSIFIER(data)

    general_summary = summarize_general(general, vader)
    category = general_summary["category"]
    score = general_summary["score"]

    metrics = {
        "data": originalData,
        "general": general_summary,
        "emotions": summarize_emotions(emotions, category),
        "toxicity": summarize_toxicity(toxicity),
        "ratios": summarize_vader(vader, score),
    }

    return {"statusCode": 200, "body": metrics}


def summarize_general(general_metrics, vader):
    category = general_metrics[0]["label"]
    intensity = general_metrics[0]["score"]

    fineCat = ""

    if category != "POSITIVE":
        intensity = intensity * -1

    # consult two differrent models to try reach consensus
    intensity = round((intensity + 1) / 2, 4)

    vader_compound = vader["compound"]
    vader_compound = round((vader_compound + 1) / 2, 4)

    diff = intensity - vader_compound
    if diff <= -0.66 or diff >= 0.66:
        fineCat = "UNDECIDED"
        score = 0.5
    else:
        score = round((vader_compound + intensity) / 2, 4)
        if score <= 0.1:
            fineCat = "VERY_NEGATIVE"
        elif score <= 0.3:
            fineCat = "NEGATIVE"
        elif score <= 0.45:
            fineCat = "SOMEWHAT_NEGATIVE"
        elif score <= 0.55:
            fineCat = "NEUTRAL"
        elif score <= 0.7:
            fineCat = "SOMEWHAT_POSITIVE"
        elif score <= 0.9:
            fineCat = "POSITIVE"
        else:
            fineCat = "VERY_POSITIVE"

    return {"category": fineCat, "score": score}


def summarize_vader(vader_metrics, score):
    neutral = vader_metrics["neu"]
    positive = vader_metrics["pos"]
    negative = vader_metrics["neg"]

    # reduce the amount of neutral and distribute between pos and neg proportionately
    neutral_adjustment = neutral * 0.5

    pos_addition = neutral_adjustment * score
    neg_addition = neutral_adjustment - pos_addition

    neutral = neutral_adjustment
    positive += pos_addition
    negative += neg_addition

    return {
        "positive": round(positive, 2),
        "neutral": round(neutral, 2),
        "negative": round(negative, 2),
    }


def summarize_emotions(emotions, category):
    # exclude certain emotions to ensure consensus
    excluded_emotions = []
    if "POSITIVE" in category:
        excluded_emotions.append("disgust")
    elif "NEGATIVE" in category:
        excluded_emotions.append("joy")

    top_three = []
    emotion_list = emotions[0]
    for emotion in emotion_list:
        name = emotion["label"]
        if name.lower() != "neutral" and name.lower() not in excluded_emotions:
            score = emotion["score"]
            if len(top_three) < 3:
                top_three.append({"label": name, "score": score})
            elif have_better(top_three, score):
                top_three = replace_worst(top_three, name, score)

    totalScore = 0
    for emotion in top_three:
        emotion["score"] = round(emotion["score"], 4)
        totalScore += emotion["score"]

    retDict = {}
    for emotion in top_three:
        retDict[emotion["label"]] = round(emotion["score"] / totalScore, 4)
    return retDict


def summarize_toxicity(toxicity):
    label = toxicity[0]["label"]
    score = toxicity[0]["score"]

    if label != "toxic":
        score = score * -1

    score = round((score + 1) / 2, 4)

    new_label = ""
    if score < 0.40:
        new_label = "Non-toxic"
    # err on the side of caution (ie: if somewhat unsure - go toxic)
    else:
        new_label = "Toxic"

    return {"level_of_toxic": new_label, "score": score}


def have_better(top_three, curr_score):
    for i in top_three:
        if i["score"] < curr_score:
            return True
    return False


def replace_worst(top_three, new_emotion_name, new_score):
    index_of_worst = -1
    curr_worst_score = 2
    for index, i in enumerate(top_three):
        if i["score"] < curr_worst_score:
            index_of_worst = index
            curr_worst_score = i["score"]
    top_three[index_of_worst] = {"label": new_emotion_name, "score": new_score}
    return top_three
