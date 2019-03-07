from django.urls import path

from . import views

app_name = "my2048bot"
urlpatterns = [
    path("bot", views.get_next_step, name="get_next_step"),
]
