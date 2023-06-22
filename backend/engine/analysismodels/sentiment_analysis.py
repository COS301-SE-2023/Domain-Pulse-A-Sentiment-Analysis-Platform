from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from preprocessor import preprocessing
from postprocessor import aggregation
from utils import mock_data
from transformers import pipeline


# # VADER scores
# ANALYSER = SentimentIntensityAnalyzer()
# # To classify emotion
# EMOTION_CLASSIFIER = pipeline(
#     "text-classification",
#     model="j-hartmann/emotion-english-distilroberta-base",
#     return_all_scores=True,
# )
# # For toxicity
# TOXIC_CLASSIFIER = pipeline(
#     "text-classification", model="martin-ha/toxic-comment-model"
# )
# # General positive or negative
# GENERAL_CLASSIFIER = pipeline(
#     "text-classification", model="distilbert-base-uncased-finetuned-sst-2-english"
# )


# def summarize_general(general_metrics):
#     category = general_metrics[0]["label"]
#     intensity = general_metrics[0]["score"]

#     fineCat = ""

#     if category == "POSITIVE":
#         if 0 <= intensity < 0.25:
#             fineCat = "SOMEWHAT_POSITIVE"
#         elif 0.25 <= intensity < 0.75:
#             fineCat = "POSITIVE"
#         else:
#             fineCat = "VERY_POSITIVE"
#     else:
#         if 0 <= intensity < 0.25:
#             fineCat = "SOMEWHAT_NEGATIVE"
#         elif 0.25 <= intensity < 0.75:
#             fineCat = "NEGATIVE"
#         else:
#             fineCat = "VERY_NEGATIVE"

#         intensity = intensity * -1

#     score = round((intensity + 1) / 2, 4)

#     return {"category": fineCat, "score": score}


# def summarize_vader(vader_metrics):
#     return {
#         "positive": vader_metrics["pos"],
#         "neutral": vader_metrics["neu"],
#         "negative": vader_metrics["neg"],
#     }


# def summarize_emotions(emotions):
#     top_three = []
#     emotion_list = emotions[0]
#     for emotion in emotion_list:
#         name = emotion["label"]
#         score = emotion["score"]
#         if len(top_three) < 3:
#             top_three.append({"label": name, "score": score})
#         elif have_better(top_three, score):
#             top_three = replace_worst(top_three, name, score)

#     totalScore = 0
#     for emotion in top_three:
#         emotion["score"] = round(emotion["score"], 4)
#         totalScore += emotion["score"]

#     retDict = {}
#     for emotion in top_three:
#         retDict[emotion["label"]] = round(emotion["score"] / totalScore, 4)
#     return retDict


# def have_better(top_three, curr_score):
#     for i in top_three:
#         if i["score"] < curr_score:
#             return True
#     return False


# def replace_worst(top_three, new_emotion_name, new_score):
#     index_of_worst = -1
#     curr_worst_score = 2
#     for index, i in enumerate(top_three):
#         if i["score"] < curr_worst_score:
#             index_of_worst = index
#             curr_worst_score = i["score"]
#     top_three[index_of_worst] = {"label": new_emotion_name, "score": new_score}
#     return top_three


# def summarize_toxicity(toxicity):
#     label = toxicity[0]["label"]
#     score = toxicity[0]["score"]

#     if label != "toxic":
#         score = score * -1

#     # print(toxicity)
#     score = round((score + 1) / 2, 4)

#     new_label = ""
#     if score < 0.25:
#         new_label = "Non-toxic"
#     elif 0.25 <= score <= 0.75:
#         new_label = "Neutral"
#     else:
#         new_label = "Toxic"

#     return {"level_of_toxic": new_label, "score": score}


# def analyse_content(data):
#     originalData = data
#     data = preprocessing.process_data(data)

#     vader = ANALYSER.polarity_scores(data)
#     emotions = EMOTION_CLASSIFIER(data)
#     toxicity = TOXIC_CLASSIFIER(data)
#     general = GENERAL_CLASSIFIER(data)

#     metrics = {
#         "data": originalData,
#         "general": summarize_general(general),
#         "emotions": summarize_emotions(emotions),
#         "toxicity": summarize_toxicity(toxicity),
#         "ratios": summarize_vader(vader),
#     }

#     return metrics


# def process_new_data(new_data: list):
#     scores = []
#     for item in new_data:
#         scores.append(analyse_content(item))
#     return scores


# def process_sentiment_records(source_id):
#     source_id = int(source_id)
#     if source_id == 1:
#         data = mock_data.starbucks_rosebank_tripadvisor
#     elif source_id == 2:
#         data = mock_data.leinster_loss_to_munster_insta
#     elif source_id == 3:
#         data = mock_data.bitcoin_article
#     elif source_id == 4:
#         data = mock_data.the_witcher_reviews_reddit
#     elif source_id == 5:
#         data = mock_data.lance_reddit_data

#     data = list(data)
#     scores = []
#     for d in data:
#         scores.append(analyse_content(d))
#     return aggregation.aggregate_sentiment_data(scores)
