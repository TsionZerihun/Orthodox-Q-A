from datetime import timedelta
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from forum.models import Question,Topic
class Command(BaseCommand):
 help='Create illustrative public questions in DEBUG only; no mock users or login bypass.'
 def handle(self,*args,**kwargs):
  if not settings.DEBUG:raise RuntimeError('Demo seed requires DEBUG')
  topics={n:Topic.objects.get_or_create(name=n)[0] for n in ['Scripture','Prayer','Fasting','Church history']}
  rows=[
   ('How can I build a daily prayer habit?','I would like to find a simple, consistent routine for morning prayer.','Prayer'),
   ('What does this church artwork represent?','How can we learn more about the meaning and tradition of church artwork?','Church history'),
   ('Where should I begin reading the Bible?','What would you suggest for someone beginning to read Scripture?','Scripture'),
  ]
  now=timezone.now()
  for index,(title,body,topic) in enumerate(rows):
   q,created=Question.objects.get_or_create(title=title,defaults={'body':body,'is_anonymous':True})
   if created:q.topics.add(topics[topic])
   # Newest first matches the approved homepage card order for local preview.
   Question.objects.filter(pk=q.pk).update(created_at=now-timedelta(hours=index*3))
  self.stdout.write('Illustrative questions ready. No real teacher answers or identities fabricated.')
