from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from utils import mock_data, preprocessing
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


def score_to_classification(general_metrics):
    category = general_metrics[0]["label"]
    intensity = general_metrics[0]["score"]

    if category == "POSITIVE":
        if 0 <= intensity < 0.25:
            return "SOMEWHAT_POSITIVE"
        elif 0.25 <= intensity < 0.75:
            return "POSITIVE"
        else:
            return "VERY_POSITIVE"
    else:
        if 0 <= intensity < 0.25:
            return "SOMEWHAT_NEGATIVE"
        elif 0.25 <= intensity < 0.75:
            return "NEGATIVE"
        else:
            return "VERY_NEGATIVE"


def analyse_content(data):
    originalData = data
    data = preprocessing.process_data(data)

    vader = ANALYSER.polarity_scores(data)
    emotions = EMOTION_CLASSIFIER(data)
    toxicity = TOXIC_CLASSIFIER(data)
    general = GENERAL_CLASSIFIER(data)

    metrics = {
        "data": originalData,
        "overall": {
            "category": score_to_classification(general),
            "intensity": general["score"],
        },
        "emotions": {
            "anger": emotions[0][0]["score"],
            "digust": emotions[0][1]["score"],
            "fear": emotions[0][2]["score"],
            "joy": emotions[0][3]["score"],
            "neutral": emotions[0][4]["score"],
            "sadness": emotions[0][5]["score"],
            "surprise": emotions[0][6]["score"],
        },
        "toxicity": {
            "isToxic": toxicity[0]["label"] == "toxic",
            "intensity": toxicity[0]["score"],
        },
        "ratios": {
            "positive": vader["pos"],
            "neutral": vader["neu"],
            "negative": vader["neg"],
        },
    }

    return metrics


def aggregate_sentiment_data(sentiment_data):
    sentiment_data = list(sentiment_data)

    summedNegRatio = 0
    summedNeuRatio = 0
    summedPosRatio = 0
    summedCompound = 0

    for entry in sentiment_data:
        metrics = entry["metrics"]
        summedNegRatio += metrics["negativeRatio"]
        summedNeuRatio += metrics["neutralRatio"]
        summedPosRatio += metrics["positiveRatio"]
        summedCompound += metrics["overallScore"]

    num = len(sentiment_data)
    aggregated_data = {
        "positiveRatio": round(summedPosRatio / num, 4),
        "neutralRatio": round(summedNeuRatio / num, 4),
        "negativeRatio": round(summedNegRatio / num, 4),
        "overallScore": round(summedCompound / num, 4),
        "classification": score_to_classification(summedCompound / num),
        "individuals": list(sentiment_data),
    }

    return aggregated_data


def process_sentiment_records(source_id):
    source_id = int(source_id)
    if source_id == 1:
        data = mock_data.starbucks_rosebank_tripadvisor
    elif source_id == 2:
        data = mock_data.leinster_loss_to_munster_insta
    elif source_id == 3:
        data = mock_data.bitcoin_article
    elif source_id == 4:
        data = mock_data.the_witcher_reviews_reddit
    elif source_id == 5:
        data = mock_data.lance_reddit_data

    data = list(data)
    scores = []
    for d in data:
        scores.append(analyse_content(d))
    return aggregate_sentiment_data(scores)
