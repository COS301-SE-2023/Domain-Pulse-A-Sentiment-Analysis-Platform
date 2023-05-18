from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from utils import sentiment_analysis, mock_data

# Create your views here.


def get_sentiment_metrics(request: HttpRequest, source_id):
    source_id = int(source_id)
    if source_id == 1:
        data = mock_data.starbucks_rosebank_tripadvisor
    elif source_id == 2:
        data = mock_data.f1_facebook_comments
    elif source_id == 3:
        data = mock_data.bitcoin_article
    elif source_id == 4:
        data = mock_data.the_witcher_reviews_reddit
    elif source_id == 5:
        data = mock_data.lance_reddit_data

    aggregated_sentiment = sentiment_analysis.process_sentiment_records(data)

    return JsonResponse(aggregated_sentiment)
