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
            "metadata": {"num_analysed": len(sentiment_data)},
            "individual_data": [],
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
        "metadata": {"num_analysed": len(sentiment_data)},
        "individual_data": sentiment_data,
    }
