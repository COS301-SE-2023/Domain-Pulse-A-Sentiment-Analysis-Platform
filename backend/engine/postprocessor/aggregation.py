import datetime


def produce_timeseries(individual_data: list):
    retData = {
        "overall": [],
        "emotions": [],
        "toxicity": [],
        "ratios": [],
        "num_records": [],
    }

    overall_data_points = []
    timestamps = []
    toxic_data_points = []

    emotions_time_series = {
        "anger": [],
        "sadness": [],
        "joy": [],
        "digust": [],
        "fear": [],
        "surprise": [],
    }

    for record in individual_data:
        # Overall
        stamp = int(record["timestamp"])
        point = record["general"]["score"], stamp
        overall_data_points.append(point)

        # Num records
        timestamps.append(stamp)

        # Emotions
        record_emotions = record["emotions"]
        for emotion in emotions_time_series:
            if emotion in record_emotions:
                emotion_point = record_emotions[emotion], stamp
                emotions_time_series[emotion].append(emotion_point)
            else:
                emotions_time_series[emotion].append((0, stamp))

        # Toxicity
        if record["toxicity"]["level_of_toxic"] == "Toxic":
            toxic_data_points.append(stamp)

    overall_data_points = sorted(overall_data_points, key=lambda x: x[1])
    timestamps = sorted(timestamps)
    toxic_data_points = sorted(toxic_data_points)

    retData["overall"] = overall_data_points
    retData["toxicity"] = toxic_data_points
    retData["num_records"] = timestamps
    retData["emotions"] = emotions_time_series

    return retData


def aggregate_sentiment_data(sentiment_data):
    sentiment_data = list(sentiment_data)

    num_individuals = len(sentiment_data)

    if num_individuals == 0:
        return {
            "overall": {
                "general": {"category": "No data", "score": 0},
                "emotions": {
                    "anger": 0,
                    "disgust": 0,
                    "fear": 0,
                    "joy": 0,
                    "neutral": 0,
                    "sadness": 0,
                    "surprise": 0,
                },
                "toxicity": {
                    "level_of_toxic": "No data",
                    "score": 0,
                },
                "ratios": {
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0,
                },
            },
            "metadata": {
                "num_analysed": len(sentiment_data),
                "earliest_record": "NA",
                "latest_record": "NA",
            },
            "individual_data": [],
            "timeseries": {},
        }

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

    earliest_timestamp = 9999999999
    latest_timestamp = -1

    num_overall_score_considered = 0

    for item in sentiment_data:
        # General (ignored undecided records)
        if item["general"]["category"] != "UNDECIDED":
            summed_overall_score += item["general"]["score"]
            num_overall_score_considered += 1

        # Emotions
        for label, score in dict(item["emotions"]).items():
            emotions[label] += score

        # Toxicity
        summed_toxicity += item["toxicity"]["score"]

        # Ratios
        summed_positive_ratio += item["ratios"]["positive"]
        summed_neutral_ratio += item["ratios"]["neutral"]
        summed_negative_ratio += item["ratios"]["negative"]

        timestamp = int(item["timestamp"])

        # Searching for latest date
        if timestamp > latest_timestamp:
            latest_timestamp = timestamp

        # Searching for earlier data
        if timestamp < earliest_timestamp:
            earliest_timestamp = timestamp

    # GENERAL
    if num_overall_score_considered == 0:
        agg_overall_score = 0.5
    else:
        agg_overall_score = round(
            summed_overall_score / num_overall_score_considered, 4
        )
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

    # EMOTIONS
    summed_emotion_scores = 0
    for score in emotions.values():
        summed_emotion_scores += score
    for label, score in emotions.items():
        emotions[label] = round(score / summed_emotion_scores, 4)

    # TOXICITY
    agg_toxicity_score = round(summed_toxicity / num_individuals, 4)
    toxic_label = ""
    if agg_toxicity_score < 0.25:
        toxic_label = "Non-toxic"
    # once again, erring on the side of toxicity
    else:
        toxic_label = "Toxic"

    # RATIOS
    agg_positive_ratio = round(summed_positive_ratio / num_individuals, 4)
    agg_neutral_ratio = round(summed_neutral_ratio / num_individuals, 4)
    agg_negative_ratio = round(summed_negative_ratio / num_individuals, 4)

    # META DATA
    earliest = datetime.datetime.fromtimestamp(earliest_timestamp)
    latest = datetime.datetime.fromtimestamp(latest_timestamp)
    earliest = earliest.strftime("%d %B %Y")
    latest = latest.strftime("%d %B %Y")

    timeseries_data = produce_timeseries(sentiment_data)

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
        "metadata": {
            "num_analysed": len(sentiment_data),
            "earliest_record": earliest,
            "latest_record": latest,
        },
        "individual_data": sentiment_data,
        "timeseries": timeseries_data,
    }
