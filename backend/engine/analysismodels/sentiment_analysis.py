from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from preprocessor import preprocessing
from utils import mock_data
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


def summarize_general(general_metrics):
    category = general_metrics[0]["label"]
    intensity = general_metrics[0]["score"]

    fineCat = ""

    if category == "POSITIVE":
        if 0 <= intensity < 0.25:
            fineCat = "SOMEWHAT_POSITIVE"
        elif 0.25 <= intensity < 0.75:
            fineCat = "POSITIVE"
        else:
            fineCat = "VERY_POSITIVE"
    else:
        if 0 <= intensity < 0.25:
            fineCat = "SOMEWHAT_NEGATIVE"
        elif 0.25 <= intensity < 0.75:
            fineCat = "NEGATIVE"
        else:
            fineCat = "VERY_NEGATIVE"

        intensity = intensity * -1

    score = round((intensity + 1) / 2, 4)

    return {"category": fineCat, "score": score}


def summarize_vader(vader_metrics):
    return {
        "positive": vader_metrics["pos"],
        "neutral": vader_metrics["neu"],
        "negative": vader_metrics["neg"],
    }


def summarize_emotions(emotions):
    top_three = []
    emotion_list = emotions[0]
    for emotion in emotion_list:
        name = emotion["label"]
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


def summarize_toxicity(toxicity):
    label = toxicity[0]["label"]
    score = toxicity[0]["score"]

    if label != "toxic":
        score = score * -1

    print(toxicity)
    score = round((score + 1) / 2, 4)

    new_label = ""
    if score < 0.25:
        new_label = "Non-toxic"
    elif 0.25 <= score <= 0.75:
        new_label = "Neutral"
    else:
        new_label = "Toxic"

    return {"level_of_toxic": new_label, "score": score}


def analyse_content(data):
    originalData = data
    data = preprocessing.process_data(data)

    vader = ANALYSER.polarity_scores(data)
    emotions = EMOTION_CLASSIFIER(data)
    toxicity = TOXIC_CLASSIFIER(data)
    general = GENERAL_CLASSIFIER(data)

    metrics = {
        "data": originalData,
        "general": summarize_general(general),
        "emotions": summarize_emotions(emotions),
        "toxicity": summarize_toxicity(toxicity),
        "ratios": summarize_vader(vader),
    }

    return metrics


def aggregate_sentiment_data(sentiment_data):
    sentiment_data = list(sentiment_data)

    num_individuals = len(sentiment_data)

    summed_overall_score = 0

    emotions = {
        "anger": 0,
        "disgust": 0,
        "fear": 0,
        "joy": 0,
        "neutral": 0,
        "sadness": 0,
        "surprise": 0,
    }

    summed_positive_ratio = 0
    summed_neutral_ratio = 0
    summed_negative_ratio = 0

    summed_toxicity = 0

    for item in sentiment_data:
        # General
        summed_overall_score += item["general"]["score"]

        # Emotions
        for label, score in dict(item["emotions"]).items():
            emotions[label] += score

        # Toxicity
        summed_toxicity += item["toxicity"]["score"]

        # Ratio
        summed_positive_ratio += item["ratios"]["positive"]
        summed_neutral_ratio += item["ratios"]["neutral"]
        summed_negative_ratio += item["ratios"]["negative"]

    agg_overall_score = round(summed_overall_score / num_individuals, 4)
    overall_cat = ""
    if 0.5 <= agg_overall_score < 0.625:
        overall_cat = "SOMEWHAT_POSITIVE"
    elif 0.625 <= agg_overall_score < 0.875:
        overall_cat = "POSITIVE"
    elif 0.875 <= agg_overall_score:
        overall_cat = "VERY_POSITIVE"
    elif 0.5 > agg_overall_score > 0.375:
        overall_cat = "SOMEWHAT_NEGATIVE"
    elif 0.375 >= agg_overall_score > 0.125:
        overall_cat = "NEGATIVE"
    else:
        overall_cat = "VERY_NEGATIVE"

    summed_emotion_scores = 0
    for score in emotions.values():
        summed_emotion_scores += score
    for label, score in emotions.items():
        emotions[label] = round(score / summed_emotion_scores, 4)

    agg_toxicity_score = round(summed_toxicity / num_individuals, 4)
    toxic_label = ""
    if agg_toxicity_score < 0.25:
        toxic_label = "Non-toxic"
    elif 0.25 <= agg_toxicity_score <= 0.75:
        toxic_label = "Neutral"
    else:
        toxic_label = "Toxic"

    agg_positive_ratio = round(summed_positive_ratio / num_individuals, 4)
    agg_neutral_ratio = round(summed_neutral_ratio / num_individuals, 4)
    agg_negative_ratio = round(summed_negative_ratio / num_individuals, 4)

    return {
        "overall": {
            "general": {"category": overall_cat, "score": agg_overall_score},
            "emotions": emotions,
            "toxicity": {"level_of_toxic": toxic_label, "score": agg_toxicity_score},
            "ratios": {
                "positive": agg_positive_ratio,
                "neutral": agg_neutral_ratio,
                "negative": agg_negative_ratio,
            },
        },
        "individual_data": sentiment_data,
    }


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
