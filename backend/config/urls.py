from django.urls import path
from forum import views
urlpatterns=[path('api/v1/health',views.health),path('api/v1/topics',views.topics),path('api/v1/questions',views.questions),path('api/v1/questions/<uuid:question_id>/answers',views.answers)]
