from django.test import TestCase, RequestFactory
from utils import mock_data
from postprocessor import aggregation
import mock
import json
from . import views
from django.http import JsonResponse, HttpRequest

# Create your tests here.


class DataAggregationTests(TestCase):
    # -------------------------- UNIT TESTS --------------------------
    def test_aggregate_sentiment_data_unit(self):
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

        result = aggregation.aggregate_sentiment_data(test_metrics["metrics"])

        assert result == {
            "overall": {
                "general": {"category": "SOMEWHAT_POSITIVE", "score": 0.6199},
                "emotions": {
                    "anger": 0.0,
                    "disgust": 0.0077,
                    "fear": 0.0,
                    "joy": 0.412,
                    "neutral": 0.2122,
                    "sadness": 0.2398,
                    "surprise": 0.1283,
                },
                "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                "ratios": {"positive": 0.2515, "neutral": 0.6819, "negative": 0.0666},
            },
            "metadata": {
                "num_analysed": 8,
                "earliest_record": "27 July 2023",
                "latest_record": "28 July 2023",
            },
            "individual_data": [
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
            ],
            "timeseries": {
                "overall": [
                    ["2023-07-27T06:35:58", 99.97],
                    ["2023-07-27T09:22:38", 85.4185],
                    ["2023-07-28T13:09:18", 87.5967],
                    ["2023-07-28T15:55:58", 74.4752],
                    ["2023-07-28T20:22:38", 63.3114],
                    ["2023-07-28T20:22:38", 68.8132],
                    ["2023-07-28T20:22:38", 72.8477],
                    ["2023-07-28T20:22:38", 76.4915],
                ],
                "emotions": {
                    "anger": [
                        ["2023-07-27T06:35:58", 0],
                        ["2023-07-27T09:22:38", 0.0],
                        ["2023-07-28T13:09:18", 0.0],
                        ["2023-07-28T15:55:58", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                    ],
                    "sadness": [
                        ["2023-07-27T06:35:58", 0],
                        ["2023-07-27T09:22:38", 0.0],
                        ["2023-07-28T13:09:18", 0.0],
                        ["2023-07-28T15:55:58", 4.1364],
                        ["2023-07-28T20:22:38", 17.5164],
                        ["2023-07-28T20:22:38", 15.1212],
                        ["2023-07-28T20:22:38", 27.9064],
                        ["2023-07-28T20:22:38", 26.5111],
                    ],
                    "joy": [
                        ["2023-07-27T06:35:58", 85.65],
                        ["2023-07-27T09:22:38", 71.8854],
                        ["2023-07-28T13:09:18", 75.2054],
                        ["2023-07-28T15:55:58", 71.4451],
                        ["2023-07-28T20:22:38", 67.8728],
                        ["2023-07-28T20:22:38", 72.5325],
                        ["2023-07-28T20:22:38", 68.9059],
                        ["2023-07-28T20:22:38", 65.627],
                    ],
                    "disgust": [
                        ["2023-07-27T06:35:58", 0],
                        ["2023-07-27T09:22:38", 0.0],
                        ["2023-07-28T13:09:18", 0.0],
                        ["2023-07-28T15:55:58", 0.0],
                        ["2023-07-28T20:22:38", 1.1106],
                        ["2023-07-28T20:22:38", 1.0551],
                        ["2023-07-28T20:22:38", 1.0023],
                        ["2023-07-28T20:22:38", 0.9522],
                    ],
                    "fear": [
                        ["2023-07-27T06:35:58", 0],
                        ["2023-07-27T09:22:38", 0.0],
                        ["2023-07-28T13:09:18", 0.0],
                        ["2023-07-28T15:55:58", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                    ],
                    "surprise": [
                        ["2023-07-27T06:35:58", 6.83],
                        ["2023-07-27T09:22:38", 14.8526],
                        ["2023-07-28T13:09:18", 12.4491],
                        ["2023-07-28T15:55:58", 12.4601],
                        ["2023-07-28T20:22:38", 11.8371],
                        ["2023-07-28T20:22:38", 10.0718],
                        ["2023-07-28T20:22:38", 10.2173],
                        ["2023-07-28T20:22:38", 11.53],
                    ],
                },
                "toxicity": [],
                "ratios": {
                    "pos": [
                        ["2023-07-27T06:35:58", 39.1],
                        ["2023-07-27T09:22:38", 36.625],
                        ["2023-07-28T13:09:18", 36.4262],
                        ["2023-07-28T15:55:58", 32.4173],
                        ["2023-07-28T20:22:38", 29.5497],
                        ["2023-07-28T20:22:38", 30.9372],
                        ["2023-07-28T20:22:38", 29.4316],
                        ["2023-07-28T20:22:38", 28.2419],
                    ],
                    "neu": [
                        ["2023-07-27T06:35:58", 60.9],
                        ["2023-07-27T09:22:38", 61.995],
                        ["2023-07-28T13:09:18", 62.4007],
                        ["2023-07-28T15:55:58", 64.8456],
                        ["2023-07-28T20:22:38", 64.6438],
                        ["2023-07-28T20:22:38", 64.1272],
                        ["2023-07-28T20:22:38", 64.9781],
                        ["2023-07-28T20:22:38", 67.0064],
                    ],
                    "neg": [
                        ["2023-07-27T06:35:58", 0.0],
                        ["2023-07-27T09:22:38", 1.38],
                        ["2023-07-28T13:09:18", 1.173],
                        ["2023-07-28T15:55:58", 2.737],
                        ["2023-07-28T20:22:38", 5.8064],
                        ["2023-07-28T20:22:38", 4.9354],
                        ["2023-07-28T20:22:38", 5.5901],
                        ["2023-07-28T20:22:38", 4.7516],
                    ],
                },
                "num_records": [
                    ["2023-07-27T06:35:58", 1],
                    ["2023-07-27T09:22:38", 2],
                    ["2023-07-28T13:09:18", 3],
                    ["2023-07-28T15:55:58", 4],
                    ["2023-07-28T20:22:38", 5],
                    ["2023-07-28T20:22:38", 6],
                    ["2023-07-28T20:22:38", 7],
                    ["2023-07-28T20:22:38", 8],
                ],
            },
        }

    def test_toxicity_aggregation_timeseries(self):
        test_metrics = {
            "metrics": [
                {
                    "data": "Lived up to the expectations. Grab and run... pleasant and fast service. Definitely a must visit again",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9994},
                    "emotions": {"surprise": 0.015, "neutral": 0.0817, "joy": 0.9033},
                    "toxicity": {"level_of_toxic": "Toxic", "score": 0.0005},
                    "ratios": {"positive": 0.353, "neutral": 0.647, "negative": 0.0},
                    "timestamp": 1690542558,
                },
                {
                    "data": "Starbucks is good because there is always good coffee, there is Wi-Fi Internet and your name will be loudly called here once. It is right if it is simple and wrong if it is unusual. All of the above is in this Starbucks, which is conveniently located at a significant intersection in Rosebank.",
                    "general": {"category": "VERY_NEGATIVE", "score": 0.0296},
                    "emotions": {"surprise": 0.514, "joy": 0.0918, "neutral": 0.3942},
                    "toxicity": {"level_of_toxic": "Toxic", "score": 0.0004},
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
                    "toxicity": {"level_of_toxic": "Toxic", "score": 0.0004},
                    "ratios": {"positive": 0.097, "neutral": 0.787, "negative": 0.116},
                    "timestamp": 1690552558,
                },
                {
                    "data": "Everything is amazing about Starbucks The service is just so good The drinks are the absolute best Keep coming back ⭐️⭐️⭐️⭐️⭐️👍",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9997},
                    "emotions": {"surprise": 0.0683, "joy": 0.8565, "neutral": 0.0752},
                    "toxicity": {"level_of_toxic": "Toxic", "score": 0.0005},
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
                    "toxicity": {"level_of_toxic": "Toxic", "score": 0.0009},
                    "ratios": {"positive": 0.133, "neutral": 0.635, "negative": 0.232},
                    "timestamp": 1690568558,
                },
                {
                    "data": "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9999},
                    "emotions": {"sadness": 0.0421, "joy": 0.9376, "surprise": 0.0203},
                    "toxicity": {"level_of_toxic": "Toxic", "score": 0.0005},
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
                    "toxicity": {"level_of_toxic": "Toxic", "score": 0.0007},
                    "ratios": {"positive": 0.209, "neutral": 0.698, "negative": 0.093},
                    "timestamp": 1690568558,
                },
                {
                    "data": "We have just moved into Melrose and this Starbucks is our local coffee bar. You can get tickets (if resident) so that everytime you buy a coffee you get the fifth one free. Great staff that get to know your name and what you are drinking.",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9714},
                    "emotions": {"surprise": 0.1751, "neutral": 0.318, "joy": 0.5069},
                    "toxicity": {"level_of_toxic": "Toxic", "score": 0.0004},
                    "ratios": {"positive": 0.215, "neutral": 0.785, "negative": 0.0},
                    "timestamp": 1690568558,
                },
            ]
        }

        result = aggregation.aggregate_sentiment_data(test_metrics["metrics"])

        assert result["timeseries"] == {
            "overall": [
                ["2023-07-27T06:35:58", 99.97],
                ["2023-07-27T09:22:38", 85.4185],
                ["2023-07-28T13:09:18", 87.5967],
                ["2023-07-28T15:55:58", 74.4752],
                ["2023-07-28T20:22:38", 63.3114],
                ["2023-07-28T20:22:38", 68.8132],
                ["2023-07-28T20:22:38", 72.8477],
                ["2023-07-28T20:22:38", 76.4915],
            ],
            "emotions": {
                "anger": [
                    ["2023-07-27T06:35:58", 0],
                    ["2023-07-27T09:22:38", 0.0],
                    ["2023-07-28T13:09:18", 0.0],
                    ["2023-07-28T15:55:58", 0.0],
                    ["2023-07-28T20:22:38", 0.0],
                    ["2023-07-28T20:22:38", 0.0],
                    ["2023-07-28T20:22:38", 0.0],
                    ["2023-07-28T20:22:38", 0.0],
                ],
                "sadness": [
                    ["2023-07-27T06:35:58", 0],
                    ["2023-07-27T09:22:38", 0.0],
                    ["2023-07-28T13:09:18", 0.0],
                    ["2023-07-28T15:55:58", 4.1364],
                    ["2023-07-28T20:22:38", 17.5164],
                    ["2023-07-28T20:22:38", 15.1212],
                    ["2023-07-28T20:22:38", 27.9064],
                    ["2023-07-28T20:22:38", 26.5111],
                ],
                "joy": [
                    ["2023-07-27T06:35:58", 85.65],
                    ["2023-07-27T09:22:38", 71.8854],
                    ["2023-07-28T13:09:18", 75.2054],
                    ["2023-07-28T15:55:58", 71.4451],
                    ["2023-07-28T20:22:38", 67.8728],
                    ["2023-07-28T20:22:38", 72.5325],
                    ["2023-07-28T20:22:38", 68.9059],
                    ["2023-07-28T20:22:38", 65.627],
                ],
                "disgust": [
                    ["2023-07-27T06:35:58", 0],
                    ["2023-07-27T09:22:38", 0.0],
                    ["2023-07-28T13:09:18", 0.0],
                    ["2023-07-28T15:55:58", 0.0],
                    ["2023-07-28T20:22:38", 1.1106],
                    ["2023-07-28T20:22:38", 1.0551],
                    ["2023-07-28T20:22:38", 1.0023],
                    ["2023-07-28T20:22:38", 0.9522],
                ],
                "fear": [
                    ["2023-07-27T06:35:58", 0],
                    ["2023-07-27T09:22:38", 0.0],
                    ["2023-07-28T13:09:18", 0.0],
                    ["2023-07-28T15:55:58", 0.0],
                    ["2023-07-28T20:22:38", 0.0],
                    ["2023-07-28T20:22:38", 0.0],
                    ["2023-07-28T20:22:38", 0.0],
                    ["2023-07-28T20:22:38", 0.0],
                ],
                "surprise": [
                    ["2023-07-27T06:35:58", 6.83],
                    ["2023-07-27T09:22:38", 14.8526],
                    ["2023-07-28T13:09:18", 12.4491],
                    ["2023-07-28T15:55:58", 12.4601],
                    ["2023-07-28T20:22:38", 11.8371],
                    ["2023-07-28T20:22:38", 10.0718],
                    ["2023-07-28T20:22:38", 10.2173],
                    ["2023-07-28T20:22:38", 11.53],
                ],
            },
            "toxicity": [
                ["2023-07-27T06:35:58", 1],
                ["2023-07-27T09:22:38", 2],
                ["2023-07-28T13:09:18", 3],
                ["2023-07-28T15:55:58", 4],
                ["2023-07-28T20:22:38", 5],
                ["2023-07-28T20:22:38", 6],
                ["2023-07-28T20:22:38", 7],
                ["2023-07-28T20:22:38", 8],
            ],
            # {
            #     "toxic_count": [
            #         {"x": "2023-07-27", "y": 2},
            #         {"x": "2023-07-28", "y": 6},
            #     ],
            #     "overall_helper": [
            #         {"x": "2023-07-27T06:35:58", "y": 99.97},
            #         {"x": "2023-07-27T09:22:38", "y": 85.4185},
            #         {"x": "2023-07-28T13:09:18", "y": 87.5967},
            #         {"x": "2023-07-28T15:55:58", "y": 74.4752},
            #         {"x": "2023-07-28T20:22:38", "y": 63.3114},
            #         {"x": "2023-07-28T20:22:38", "y": 68.8132},
            #         {"x": "2023-07-28T20:22:38", "y": 72.8477},
            #         {"x": "2023-07-28T20:22:38", "y": 76.4915},
            #     ],
            # },
            "ratios": {
                "pos": [
                    ["2023-07-27T06:35:58", 39.1],
                    ["2023-07-27T09:22:38", 36.625],
                    ["2023-07-28T13:09:18", 36.4262],
                    ["2023-07-28T15:55:58", 32.4173],
                    ["2023-07-28T20:22:38", 29.5497],
                    ["2023-07-28T20:22:38", 30.9372],
                    ["2023-07-28T20:22:38", 29.4316],
                    ["2023-07-28T20:22:38", 28.2419],
                ],
                "neu": [
                    ["2023-07-27T06:35:58", 60.9],
                    ["2023-07-27T09:22:38", 61.995],
                    ["2023-07-28T13:09:18", 62.4007],
                    ["2023-07-28T15:55:58", 64.8456],
                    ["2023-07-28T20:22:38", 64.6438],
                    ["2023-07-28T20:22:38", 64.1272],
                    ["2023-07-28T20:22:38", 64.9781],
                    ["2023-07-28T20:22:38", 67.0064],
                ],
                "neg": [
                    ["2023-07-27T06:35:58", 0.0],
                    ["2023-07-27T09:22:38", 1.38],
                    ["2023-07-28T13:09:18", 1.173],
                    ["2023-07-28T15:55:58", 2.737],
                    ["2023-07-28T20:22:38", 5.8064],
                    ["2023-07-28T20:22:38", 4.9354],
                    ["2023-07-28T20:22:38", 5.5901],
                    ["2023-07-28T20:22:38", 4.7516],
                ],
            },
            "num_records": [
                ["2023-07-27T06:35:58", 1],
                ["2023-07-27T09:22:38", 2],
                ["2023-07-28T13:09:18", 3],
                ["2023-07-28T15:55:58", 4],
                ["2023-07-28T20:22:38", 5],
                ["2023-07-28T20:22:38", 6],
                ["2023-07-28T20:22:38", 7],
                ["2023-07-28T20:22:38", 8],
            ],
        }

    # ----------------------------------------------------------------

    # ---------------------- INTEGRATION TESTS -----------------------
    def setUp(self):
        self.factory = RequestFactory()

    def test_aggregate_metrics(self):
        request_body = {
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

        response: JsonResponse = self.client.post(
            path="/aggregator/aggregate/",
            data=request_body,
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)

        expected_data = {
            "overall": {
                "general": {"category": "SOMEWHAT_POSITIVE", "score": 0.6199},
                "emotions": {
                    "anger": 0.0,
                    "disgust": 0.0077,
                    "fear": 0.0,
                    "joy": 0.412,
                    "neutral": 0.2122,
                    "sadness": 0.2398,
                    "surprise": 0.1283,
                },
                "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                "ratios": {"positive": 0.2515, "neutral": 0.6819, "negative": 0.0666},
            },
            "metadata": {
                "num_analysed": 8,
                "earliest_record": "27 July 2023",
                "latest_record": "28 July 2023",
            },
            "individual_data": [
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
            ],
            "timeseries": {
                "overall": [
                    ["2023-07-27T06:35:58", 99.97],
                    ["2023-07-27T09:22:38", 85.4185],
                    ["2023-07-28T13:09:18", 87.5967],
                    ["2023-07-28T15:55:58", 74.4752],
                    ["2023-07-28T20:22:38", 63.3114],
                    ["2023-07-28T20:22:38", 68.8132],
                    ["2023-07-28T20:22:38", 72.8477],
                    ["2023-07-28T20:22:38", 76.4915],
                ],
                "emotions": {
                    "anger": [
                        ["2023-07-27T06:35:58", 0],
                        ["2023-07-27T09:22:38", 0.0],
                        ["2023-07-28T13:09:18", 0.0],
                        ["2023-07-28T15:55:58", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                    ],
                    "sadness": [
                        ["2023-07-27T06:35:58", 0],
                        ["2023-07-27T09:22:38", 0.0],
                        ["2023-07-28T13:09:18", 0.0],
                        ["2023-07-28T15:55:58", 4.1364],
                        ["2023-07-28T20:22:38", 17.5164],
                        ["2023-07-28T20:22:38", 15.1212],
                        ["2023-07-28T20:22:38", 27.9064],
                        ["2023-07-28T20:22:38", 26.5111],
                    ],
                    "joy": [
                        ["2023-07-27T06:35:58", 85.65],
                        ["2023-07-27T09:22:38", 71.8854],
                        ["2023-07-28T13:09:18", 75.2054],
                        ["2023-07-28T15:55:58", 71.4451],
                        ["2023-07-28T20:22:38", 67.8728],
                        ["2023-07-28T20:22:38", 72.5325],
                        ["2023-07-28T20:22:38", 68.9059],
                        ["2023-07-28T20:22:38", 65.627],
                    ],
                    "disgust": [
                        ["2023-07-27T06:35:58", 0],
                        ["2023-07-27T09:22:38", 0.0],
                        ["2023-07-28T13:09:18", 0.0],
                        ["2023-07-28T15:55:58", 0.0],
                        ["2023-07-28T20:22:38", 1.1106],
                        ["2023-07-28T20:22:38", 1.0551],
                        ["2023-07-28T20:22:38", 1.0023],
                        ["2023-07-28T20:22:38", 0.9522],
                    ],
                    "fear": [
                        ["2023-07-27T06:35:58", 0],
                        ["2023-07-27T09:22:38", 0.0],
                        ["2023-07-28T13:09:18", 0.0],
                        ["2023-07-28T15:55:58", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                        ["2023-07-28T20:22:38", 0.0],
                    ],
                    "surprise": [
                        ["2023-07-27T06:35:58", 6.83],
                        ["2023-07-27T09:22:38", 14.8526],
                        ["2023-07-28T13:09:18", 12.4491],
                        ["2023-07-28T15:55:58", 12.4601],
                        ["2023-07-28T20:22:38", 11.8371],
                        ["2023-07-28T20:22:38", 10.0718],
                        ["2023-07-28T20:22:38", 10.2173],
                        ["2023-07-28T20:22:38", 11.53],
                    ],
                },
                "toxicity": [],
                "ratios": {
                    "pos": [
                        ["2023-07-27T06:35:58", 39.1],
                        ["2023-07-27T09:22:38", 36.625],
                        ["2023-07-28T13:09:18", 36.4262],
                        ["2023-07-28T15:55:58", 32.4173],
                        ["2023-07-28T20:22:38", 29.5497],
                        ["2023-07-28T20:22:38", 30.9372],
                        ["2023-07-28T20:22:38", 29.4316],
                        ["2023-07-28T20:22:38", 28.2419],
                    ],
                    "neu": [
                        ["2023-07-27T06:35:58", 60.9],
                        ["2023-07-27T09:22:38", 61.995],
                        ["2023-07-28T13:09:18", 62.4007],
                        ["2023-07-28T15:55:58", 64.8456],
                        ["2023-07-28T20:22:38", 64.6438],
                        ["2023-07-28T20:22:38", 64.1272],
                        ["2023-07-28T20:22:38", 64.9781],
                        ["2023-07-28T20:22:38", 67.0064],
                    ],
                    "neg": [
                        ["2023-07-27T06:35:58", 0.0],
                        ["2023-07-27T09:22:38", 1.38],
                        ["2023-07-28T13:09:18", 1.173],
                        ["2023-07-28T15:55:58", 2.737],
                        ["2023-07-28T20:22:38", 5.8064],
                        ["2023-07-28T20:22:38", 4.9354],
                        ["2023-07-28T20:22:38", 5.5901],
                        ["2023-07-28T20:22:38", 4.7516],
                    ],
                },
                "num_records": [
                    ["2023-07-27T06:35:58", 1],
                    ["2023-07-27T09:22:38", 2],
                    ["2023-07-28T13:09:18", 3],
                    ["2023-07-28T15:55:58", 4],
                    ["2023-07-28T20:22:38", 5],
                    ["2023-07-28T20:22:38", 6],
                    ["2023-07-28T20:22:38", 7],
                    ["2023-07-28T20:22:38", 8],
                ],
            },
        }

        self.assertEqual(response.json(), expected_data)

    def test_aggregate_metrics_empty_data(self):
        request_body = {"metrics": []}

        response: JsonResponse = self.client.post(
            path="/aggregator/aggregate/",
            data=request_body,
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)

        assert response.json() == {
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
                "num_analysed": 0,
                "earliest_record": "NA",
                "latest_record": "NA",
            },
            "individual_data": [],
            "timeseries": {},
        }

    # ----------------------------------------------------------------
