from django.urls import path

from . import views

app_name = "my2048bot"
urlpatterns = [
    path("hint", views.get_next_step, name="get_next_step"),
    path("available_methods", views.get_available_methods, name="get_available_methods")
]
