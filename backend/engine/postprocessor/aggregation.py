import datetime
import pytz


def get_new_ema(current, old_ema, smoothing_factor):
    SMOOTHING_FACTOR = smoothing_factor
    if old_ema == -1:
        return current * 100
    else:
        return round(
            (current * 100) * SMOOTHING_FACTOR + old_ema * (1 - SMOOTHING_FACTOR), 4
        )


def produce_timeseries(individual_data: list):
    # Sorting the incoming individual data
    individual_data = sorted(individual_data, key=lambda x: int(x["timestamp"]))

    retData = {
        "overall": [],
        "emotions": [],
        "toxicity": [],
        "ratios": [],
        "num_records": [],
    }

    overall_data_points = []
    num_sentiments = []
    # toxic_data_points = {"toxic_count": [], "overall_helper": []}
    ratios_time_series = {"pos": [], "neu": [], "neg": []}
    emotions_time_series = {
        "anger": [],
        "sadness": [],
        "joy": [],
        "disgust": [],
        "fear": [],
        "surprise": [],
    }

    ema_tracker = {
        "overall": -1,
        "anger": -1,
        "sadness": -1,
        "joy": -1,
        "disgust": -1,
        "fear": -1,
        "surprise": -1,
        "pos": -1,
        "neu": -1,
        "neg": -1,
    }

    # Lower = more smooth, less responsive
    # Higher = more erratic, very responsive
    SMOOTHING_FACTORS = {
        "overall": 0.15,
        "emotions_hit": 0.18,
        "ratios": 0.15,
        "emotions_miss": 0.05,
    }
    cumulative_num_sentiments = 0

    toxicity_tracker = []
    total_toxic_count = 0

    for record in individual_data:
        stamp_unix = int(record["timestamp"])
        # timestamp = datetime.datetime.fromtimestamp(stamp_unix)
        timestamp = datetime.datetime.utcfromtimestamp(stamp_unix)
        timestamp = timestamp.astimezone(pytz.timezone("Africa/Johannesburg"))
        stamp = timestamp.strftime("%Y-%m-%dT%H:%M:%S")
        # day_stamp = timestamp.strftime("%Y-%m-%d")

        # Overall
        if record["general"]["category"] != "UNDECIDED":
            new_overall_ema = get_new_ema(
                record["general"]["score"],
                ema_tracker["overall"],
                SMOOTHING_FACTORS["overall"],
            )
            point = [stamp, new_overall_ema]
            overall_data_points.append(point)
            ema_tracker["overall"] = new_overall_ema

        # Num sentiments
        cumulative_num_sentiments += 1
        num_sentiments.append([stamp, cumulative_num_sentiments])

        # Emotions
        record_emotions = record["emotions"]
        for emotion in emotions_time_series:
            if emotion in record_emotions:
                new_emotion_ema = get_new_ema(
                    record_emotions[emotion],
                    ema_tracker[emotion],
                    SMOOTHING_FACTORS["emotions_hit"],
                )
                emotion_point = [stamp, new_emotion_ema]
                emotions_time_series[emotion].append(emotion_point)
                ema_tracker[emotion] = new_emotion_ema
            else:
                new_emotion_ema = get_new_ema(
                    0,
                    ema_tracker[emotion],
                    SMOOTHING_FACTORS["emotions_miss"],
                )
                emotion_point = [stamp, new_emotion_ema]
                emotions_time_series[emotion].append(emotion_point)
                ema_tracker[emotion] = new_emotion_ema

        # Toxicity
        if record["toxicity"]["level_of_toxic"] == "Toxic":
            total_toxic_count += 1
            toxicity_tracker.append([stamp, total_toxic_count])

        # Ratios
        # Pos
        new_pos_ema = get_new_ema(
            record["ratios"]["positive"],
            ema_tracker["pos"],
            SMOOTHING_FACTORS["ratios"],
        )
        pos_point = [stamp, new_pos_ema]
        ratios_time_series["pos"].append(pos_point)
        ema_tracker["pos"] = new_pos_ema
        # Neu
        new_neu_ema = get_new_ema(
            record["ratios"]["neutral"],
            ema_tracker["neu"],
            SMOOTHING_FACTORS["ratios"],
        )
        neu_point = [stamp, new_neu_ema]
        ratios_time_series["neu"].append(neu_point)
        ema_tracker["neu"] = new_neu_ema
        # Neg
        new_neg_ema = get_new_ema(
            record["ratios"]["negative"],
            ema_tracker["neg"],
            SMOOTHING_FACTORS["ratios"],
        )
        neg_point = [stamp, new_neg_ema]
        ratios_time_series["neg"].append(neg_point)
        ema_tracker["neg"] = new_neg_ema

    # Formatting toxicity
    # for day, count in toxicity_tracker.items():
    #     toxic_data_points["toxic_count"].append({"x": day, "y": count})
    # toxic_data_points["overall_helper"] = [
    #     {"x": ts, "y": sc} for ts, sc in overall_data_points
    # ]

    retData["overall"] = overall_data_points
    retData["toxicity"] = toxicity_tracker
    retData["num_records"] = num_sentiments
    retData["emotions"] = emotions_time_series
    retData["ratios"] = ratios_time_series

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
