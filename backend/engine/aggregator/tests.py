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
                },
                {
                    "data": "Starbucks is good because there is always good coffee, there is Wi-Fi Internet and your name will be loudly called here once. It is right if it is simple and wrong if it is unusual. All of the above is in this Starbucks, which is conveniently located at a significant intersection in Rosebank.",
                    "general": {"category": "VERY_NEGATIVE", "score": 0.0296},
                    "emotions": {"surprise": 0.514, "joy": 0.0918, "neutral": 0.3942},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.226, "neutral": 0.682, "negative": 0.092},
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
                },
                {
                    "data": "Everything is amazing about Starbucks The service is just so good The drinks are the absolute best Keep coming back ⭐️⭐️⭐️⭐️⭐️👍",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9997},
                    "emotions": {"surprise": 0.0683, "joy": 0.8565, "neutral": 0.0752},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.391, "neutral": 0.609, "negative": 0.0},
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
                },
                {
                    "data": "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9999},
                    "emotions": {"sadness": 0.0421, "joy": 0.9376, "surprise": 0.0203},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.388, "neutral": 0.612, "negative": 0.0},
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
                },
                {
                    "data": "We have just moved into Melrose and this Starbucks is our local coffee bar. You can get tickets (if resident) so that everytime you buy a coffee you get the fifth one free. Great staff that get to know your name and what you are drinking.",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9714},
                    "emotions": {"surprise": 0.1751, "neutral": 0.318, "joy": 0.5069},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.215, "neutral": 0.785, "negative": 0.0},
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
            "metadata": {"num_analysed": 8},
            "individual_data": [
                {
                    "data": "Lived up to the expectations. Grab and run... pleasant and fast service. Definitely a must visit again",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9994},
                    "emotions": {"surprise": 0.015, "neutral": 0.0817, "joy": 0.9033},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.353, "neutral": 0.647, "negative": 0.0},
                },
                {
                    "data": "Starbucks is good because there is always good coffee, there is Wi-Fi Internet and your name will be loudly called here once. It is right if it is simple and wrong if it is unusual. All of the above is in this Starbucks, which is conveniently located at a significant intersection in Rosebank.",
                    "general": {"category": "VERY_NEGATIVE", "score": 0.0296},
                    "emotions": {"surprise": 0.514, "joy": 0.0918, "neutral": 0.3942},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.226, "neutral": 0.682, "negative": 0.092},
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
                },
                {
                    "data": "Everything is amazing about Starbucks The service is just so good The drinks are the absolute best Keep coming back ⭐️⭐️⭐️⭐️⭐️👍",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9997},
                    "emotions": {"surprise": 0.0683, "joy": 0.8565, "neutral": 0.0752},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.391, "neutral": 0.609, "negative": 0.0},
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
                },
                {
                    "data": "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9999},
                    "emotions": {"sadness": 0.0421, "joy": 0.9376, "surprise": 0.0203},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.388, "neutral": 0.612, "negative": 0.0},
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
                },
                {
                    "data": "We have just moved into Melrose and this Starbucks is our local coffee bar. You can get tickets (if resident) so that everytime you buy a coffee you get the fifth one free. Great staff that get to know your name and what you are drinking.",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9714},
                    "emotions": {"surprise": 0.1751, "neutral": 0.318, "joy": 0.5069},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.215, "neutral": 0.785, "negative": 0.0},
                },
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
                },
                {
                    "data": "Starbucks is good because there is always good coffee, there is Wi-Fi Internet and your name will be loudly called here once. It is right if it is simple and wrong if it is unusual. All of the above is in this Starbucks, which is conveniently located at a significant intersection in Rosebank.",
                    "general": {"category": "VERY_NEGATIVE", "score": 0.0296},
                    "emotions": {"surprise": 0.514, "joy": 0.0918, "neutral": 0.3942},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.226, "neutral": 0.682, "negative": 0.092},
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
                },
                {
                    "data": "Everything is amazing about Starbucks The service is just so good The drinks are the absolute best Keep coming back ⭐️⭐️⭐️⭐️⭐️👍",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9997},
                    "emotions": {"surprise": 0.0683, "joy": 0.8565, "neutral": 0.0752},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.391, "neutral": 0.609, "negative": 0.0},
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
                },
                {
                    "data": "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9999},
                    "emotions": {"sadness": 0.0421, "joy": 0.9376, "surprise": 0.0203},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.388, "neutral": 0.612, "negative": 0.0},
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
                },
                {
                    "data": "We have just moved into Melrose and this Starbucks is our local coffee bar. You can get tickets (if resident) so that everytime you buy a coffee you get the fifth one free. Great staff that get to know your name and what you are drinking.",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9714},
                    "emotions": {"surprise": 0.1751, "neutral": 0.318, "joy": 0.5069},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.215, "neutral": 0.785, "negative": 0.0},
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
            "metadata": {"num_analysed": 8},
            "individual_data": [
                {
                    "data": "Lived up to the expectations. Grab and run... pleasant and fast service. Definitely a must visit again",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9994},
                    "emotions": {"surprise": 0.015, "neutral": 0.0817, "joy": 0.9033},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.353, "neutral": 0.647, "negative": 0.0},
                },
                {
                    "data": "Starbucks is good because there is always good coffee, there is Wi-Fi Internet and your name will be loudly called here once. It is right if it is simple and wrong if it is unusual. All of the above is in this Starbucks, which is conveniently located at a significant intersection in Rosebank.",
                    "general": {"category": "VERY_NEGATIVE", "score": 0.0296},
                    "emotions": {"surprise": 0.514, "joy": 0.0918, "neutral": 0.3942},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.226, "neutral": 0.682, "negative": 0.092},
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
                },
                {
                    "data": "Everything is amazing about Starbucks The service is just so good The drinks are the absolute best Keep coming back ⭐️⭐️⭐️⭐️⭐️👍",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9997},
                    "emotions": {"surprise": 0.0683, "joy": 0.8565, "neutral": 0.0752},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.391, "neutral": 0.609, "negative": 0.0},
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
                },
                {
                    "data": "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9999},
                    "emotions": {"sadness": 0.0421, "joy": 0.9376, "surprise": 0.0203},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0005},
                    "ratios": {"positive": 0.388, "neutral": 0.612, "negative": 0.0},
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
                },
                {
                    "data": "We have just moved into Melrose and this Starbucks is our local coffee bar. You can get tickets (if resident) so that everytime you buy a coffee you get the fifth one free. Great staff that get to know your name and what you are drinking.",
                    "general": {"category": "VERY_POSITIVE", "score": 0.9714},
                    "emotions": {"surprise": 0.1751, "neutral": 0.318, "joy": 0.5069},
                    "toxicity": {"level_of_toxic": "Non-toxic", "score": 0.0004},
                    "ratios": {"positive": 0.215, "neutral": 0.785, "negative": 0.0},
                },
            ],
        }

        self.assertEqual(response.json(), expected_data)

    # ----------------------------------------------------------------
