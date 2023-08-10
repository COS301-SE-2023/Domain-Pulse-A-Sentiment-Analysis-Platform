from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, HttpResponse
from utils import mock_data
from django.views.decorators.csrf import csrf_exempt
from processor import processing
from postprocessor import aggregation
import json
import socketio

# Create your views here.


# Uses the mock data
# def get_sentiment_metrics(request: HttpRequest, source_id):
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
#         scores.append(processing.analyse_content(d))

#     return JsonResponse(aggregation.aggregate_sentiment_data(scores))


# Perform analysis on given data
@csrf_exempt
def perform_analysis(request: HttpRequest):
    if request.method == "POST":
        raw_data = json.loads(request.body)
        new_records = raw_data["data"]

        scores = []

        if "room_id" in raw_data:
            sio = socketio.Client()
            sio.connect("http://localhost:5000")

            room_id = raw_data["room_id"]

            for item, timestamp in zip(new_records, raw_data["data_timestamps"]):
                new_score = processing.analyse_content(item)
                new_score["timestamp"] = timestamp

                # compute aggregated metrics
                aggregated_metrics = aggregation.aggregate_sentiment_data(scores)
                new_data_to_send = {
                    "new_individual_metrics": new_score,
                    "aggregated_metrics": aggregated_metrics,
                    "room_id": room_id,
                }

                sio.emit("new_source_data", new_data_to_send)

                scores.append(new_score)

            sio.disconnect()
        else:
            for item in new_records:
                scores.append(processing.analyse_content(item))

        return JsonResponse({"metrics": scores})
    return JsonResponse({"status": "FAILURE"})


#     source_id = int(source_id)
#     aggregated_sentiment = sentiment_analysis.process_sentiment_records(source_id)

#     individuals = list(aggregated_sentiment.get("individuals"))

#     individuals_data = ""
#     for i in individuals:
#         individuals_data += f"<p>{ i['data'] }</p>"
#         individuals_data += (
#             f"<p><b>Positive Ratio: { i['metrics']['positiveRatio'] }</b></p>"
#         )
#         individuals_data += (
#             f"<p><b>Neutral Ratio: { i['metrics']['neutralRatio'] }</b></p>"
#         )
#         individuals_data += (
#             f"<p><b>Negative Ratio: { i['metrics']['negativeRatio'] }</b></p>"
#         )
#         individuals_data += (
#             f"<p><b>Overall Score: { i['metrics']['overallScore'] }</b></p>"
#         )
#         individuals_data += (
#             f"<p><b>Classification: { i['metrics']['classification'] }</b></p>"
#         )
#         individuals_data += "</br></br>"

#     agg_positiveRatio = aggregated_sentiment["positiveRatio"]
#     agg_neutralRatio = aggregated_sentiment["neutralRatio"]
#     agg_negativeRatio = aggregated_sentiment["negativeRatio"]
#     agg_overallScore = aggregated_sentiment["overallScore"]
#     agg_classification = aggregated_sentiment["classification"]

#     response = f"""
# <!DOCTYPE html>
# <html lang="en">
# <head>
#     <meta charset="UTF-8">
#     <meta http-equiv="X-UA-Compatible" content="IE=edge">
#     <meta name="viewport" content="width=device-width, initial-scale=1.0">
#     <title>Analysis Engine</title>
# </head>
# <body>
#     <h1>Computed Sentiment Metrics</h1>

#     <h3>Aggregated Metrics</h3>
#     <h4>Positive Ratio : {agg_positiveRatio}</h4>
#     <h4>Neutral Ratio : {agg_neutralRatio}</h4>
#     <h4>Negative Ratio : {agg_negativeRatio}</h4>
#     <h4>Overall Score : {agg_overallScore}</h4>
#     <h4>Classification : {agg_classification}</h4>

#     <h3>Individual Data and Metrics</h3>
#     {individuals_data}

# </body>
# </html>
#     """

#     return HttpResponse(response)


# def testing_preprocessing(request: HttpRequest):
#     sample_text = "If I could live here, I would. i love Starbucks on Rosebank that much. The best blueberry muffins I have ever tasted. Great coffee as well :-)"
#     returnData = preprocessing.process_data(sample_text)
#     return JsonResponse({"original": sample_text, "processed": returnData})
