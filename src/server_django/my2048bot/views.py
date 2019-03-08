import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
from .bot.bot import available_bot_methods, suggest_next_step


@csrf_exempt
def get_next_step(request):
    if request.method == "POST":
        post_dict = json.loads(request.body.decode('utf-8'))
        suggestions = suggest_next_step(post_dict["method"], post_dict["checkboard"], post_dict["game_size"])

        return JsonResponse({"status": "OK",
                             "details": {
                                 "suggest": suggestions
                             }})
    else:
        return HttpResponseBadRequest(
            content="Request method must be POST."
        )


@csrf_exempt
def get_available_methods(request):
    return JsonResponse({"status": "OK",
                         "details": {
                             "available_methods": available_bot_methods
                         }})
