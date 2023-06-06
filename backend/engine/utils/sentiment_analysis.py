from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from utils import mock_data, preprocessing

from transformers import (
    pipeline,
    AutoModelForSequenceClassification,
    AutoTokenizer,
    TextClassificationPipeline,
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
)

# from happytransformer import HappyTextClassification

ANALYSER = SentimentIntensityAnalyzer()
# To classify emotion
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True,
)


def score_to_classification(score):
    overall_sentiment = ""
    if -1 <= score <= -0.75:
        overall_sentiment = "VERY_NEGATIVE"
    elif -0.75 < score <= -0.25:
        overall_sentiment = "NEGATIVE"
    elif -0.25 < score <= -0.1:
        overall_sentiment = "SOMEWHAT_NEGATIVE"
    elif -0.1 < score < 0.1:
        overall_sentiment = "NEUTRAL"
    elif 0.1 <= score < 0.25:
        overall_sentiment = "SOMEWHAT_POSTIVE"
    elif 0.25 <= score < 0.75:
        overall_sentiment = "POSITIVE"
    elif 0.75 <= score <= 1:
        overall_sentiment = "VERY_POSTIVE"
    return overall_sentiment


def analyse_content(data):
    results = ANALYSER.polarity_scores(data)
    emotions = emotion_classifier(data)
    negative = results["neg"]
    neutral = results["neu"]
    positive = results["pos"]
    compound = results["compound"]

    sentimentData = {
        "data": data,
        "metrics": {
            "positiveRatio": positive,
            "neutralRatio": neutral,
            "negativeRatio": negative,
            "overallScore": compound,
            "classification": score_to_classification(compound),
            "emotions": emotions,
        },
    }
    print(emotions)
    return sentimentData


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
        # processed_data = preprocessing.process_data(d)
        scores.append(analyse_content(d))
    return aggregate_sentiment_data(scores)
