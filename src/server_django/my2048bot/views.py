from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
from django.http import JsonResponse
from .bot.bot import suggest_next_step


@csrf_exempt
def get_next_step(request):
    if request.method:
        suggestions = suggest_next_step([0], [1, 1])

        return JsonResponse({"status": "OK",
                             "details": {
                                 "suggest": suggestions
                             }})
    else:
        return JsonResponse({"status": "error",
                             "details": {
                                 "method": request.method
                             }})
