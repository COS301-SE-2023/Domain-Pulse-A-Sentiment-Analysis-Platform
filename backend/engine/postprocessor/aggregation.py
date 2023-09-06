import datetime
import pytz

test_metrics = {
    "metrics": [
        {
            "data": "Lived up to the expectations. Grab and run... pleasant and fast service. Definitely a must visit again",
            "general": {"category": "VERY_POSITIVE", "score": 0.9994},
            "emotions": {"surprise": 0.015, "neutral": 0.0817, "joy": 0.9033},
            "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
            "ratios": {"positive": 0.353, "neutral": 0.647, "negative": 0.0},
            "timestamp": 1690542558,
        },
        {
            "data": "Starbucks is good because there is always good coffee, there is Wi-Fi Internet and your name will be loudly called here once. It is right if it is simple and wrong if it is unusual. All of the above is in this Starbucks, which is conveniently located at a significant intersection in Rosebank.",
            "general": {"category": "VERY_NEGATIVE", "score": 0.0296},
            "emotions": {"surprise": 0.514, "joy": 0.0918, "neutral": 0.3942},
            "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
            "ratios": {"positive": 0.226, "neutral": 0.682, "negative": 0.092},
            "timestamp": 1690442558,
        },
        {
            "data": "I just got looked at when I was at the wrong side of the line (not clear where the right side is) Could not spell my name correctly even though I spelt it out 3 times.",
            "general": {"category": "VERY_NEGATIVE", "score": 0.0012},
            "emotions": {
                "surprise": 0.1251,
                "neutral": 0.6451,
                "sadness": 0.2298,
            },
            "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
            "ratios": {"positive": 0.097, "neutral": 0.787, "negative": 0.116},
            "timestamp": 1690552558,
        },
        {
            "data": "Everything is amazing about Starbucks The service is just so good The drinks are the absolute best Keep coming back ⭐️⭐️⭐️⭐️⭐️👍",
            "general": {"category": "VERY_POSITIVE", "score": 0.9997},
            "emotions": {"surprise": 0.0683, "joy": 0.8565, "neutral": 0.0752},
            "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
            "ratios": {"positive": 0.391, "neutral": 0.609, "negative": 0.0},
            "timestamp": 1690432558,
        },
        {
            "data": "Just bad choice of blend. Poorly made. Really bad texture of frothed milk. Very hyped. Seattle Coffee Co. still the best.",
            "general": {"category": "VERY_NEGATIVE", "score": 0.0005},
            "emotions": {
                "sadness": 0.7847,
                "disgust": 0.0617,
                "neutral": 0.1536,
            },
            "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0009},
            "ratios": {"positive": 0.133, "neutral": 0.635, "negative": 0.232},
            "timestamp": 1690568558,
        },
        {
            "data": "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)",
            "general": {"category": "VERY_POSITIVE", "score": 0.9999},
            "emotions": {"sadness": 0.0421, "joy": 0.9376, "surprise": 0.0203},
            "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
            "ratios": {"positive": 0.388, "neutral": 0.612, "negative": 0.0},
            "timestamp": 1690568558,
        },
        {
            "data": "Coffee is always Good , but unfortunately the food is not up to Starbucks quality Like overseas , the food is premade and delivered , so if you eat a toasted cheese it just get heated up in the microwave",
            "general": {"category": "VERY_POSITIVE", "score": 0.9571},
            "emotions": {
                "sadness": 0.8615,
                "surprise": 0.1088,
                "neutral": 0.0298,
            },
            "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0007},
            "ratios": {"positive": 0.209, "neutral": 0.698, "negative": 0.093},
            "timestamp": 1690568558,
        },
        {
            "data": "We have just moved into Melrose and this Starbucks is our local coffee bar. You can get tickets (if resident) so that everytime you buy a coffee you get the fifth one free. Great staff that get to know your name and what you are drinking.",
            "general": {"category": "VERY_POSITIVE", "score": 0.9714},
            "emotions": {"surprise": 0.1751, "neutral": 0.318, "joy": 0.5069},
            "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
            "ratios": {"positive": 0.215, "neutral": 0.785, "negative": 0.0},
            "timestamp": 1690568558,
        },
    ]
}


def get_new_ema(current, old_ema, smoothing_factor):
    SMOOTHING_FACTOR = smoothing_factor
    if old_ema == -1:
        return current
    else:
        return round(current * SMOOTHING_FACTOR + old_ema * (1 - SMOOTHING_FACTOR), 4)


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
    toxic_data_points = []
    ratios_time_series = {"pos": [], "neu": [], "neg": []}
    emotions_time_series = {
        "anger": [],
        "sadness": [],
        "joy": [],
        "digust": [],
        "fear": [],
        "surprise": [],
    }

    ema_tracker = {
        "overall": -1,
        "anger": -1,
        "sadness": -1,
        "joy": -1,
        "digust": -1,
        "fear": -1,
        "surprise": -1,
        "pos": -1,
        "neu": -1,
        "neg": -1,
    }

    # Lower = more smooth, less responsive
    # Higher = more erratic, very responsive
    SMOOTHING_FACTORS = {
        "overall": 0.3,
        "emotions_hit": 0.5,
        "ratios": 0.3,
        "emotions_miss": 0.2,
    }
    cumulative_num_sentiments = 0

    toxicity_tracker = {}

    for record in individual_data:
        stamp_unix = int(record["timestamp"])
        timestamp = datetime.datetime.fromtimestamp(stamp_unix)
        timestamp = timestamp.astimezone(pytz.timezone("Africa/Johannesburg"))
        stamp = timestamp.strftime("%Y-%m-%dT%H:%M:%S")
        day_stamp = timestamp.strftime("%Y-%m-%d")

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
            if day_stamp in toxicity_tracker:
                toxicity_tracker[day_stamp] = toxicity_tracker[day_stamp] + 1
            else:
                toxicity_tracker[day_stamp] = 1

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
    for day, count in toxicity_tracker.items():
        toxic_data_points.append({"x": day, "y": count})

    retData["overall"] = overall_data_points
    retData["toxicity"] = toxic_data_points
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
