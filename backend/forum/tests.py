import uuid
from unittest.mock import patch
from django.test import TestCase
from .models import Account,Topic,Question,Answer
class FoundationTests(TestCase):
 def setUp(self):
  self.a=Account.objects.create(supabase_user_id=uuid.uuid4(),display_name='Private Name')
  self.t=Topic.objects.create(name='Prayer')
  self.q=Question.objects.create(author=self.a,title='A private question about prayer',is_anonymous=True)
  self.q.topics.add(self.t)
 def test_public_anonymity(self):
  response=self.client.get('/api/v1/questions');self.assertEqual(response.status_code,200)
  self.assertNotIn('Private Name',response.content.decode());self.assertNotIn(str(self.a.id),response.content.decode())
 def test_auth_required(self):
  self.assertEqual(self.client.post('/api/v1/questions',data={'title':'Question title here'},content_type='application/json').status_code,401)
 def test_removed_parent_hidden(self):
  self.q.status='removed';self.q.save()
  self.assertEqual(self.client.get(f'/api/v1/questions/{self.q.id}/answers').status_code,404)
 def test_self_answer_anonymous_after_detach(self):
  a=Answer.objects.create(question=self.q,author=self.a,body='A sufficiently long answer',is_question_author=True)
  self.a.delete()
  response=self.client.get(f'/api/v1/questions/{self.q.id}/answers')
  self.assertEqual(response.json()['items'][0]['author']['label'],'Anonymous author')
 def test_topic_limit(self):
  with patch('forum.views.identity',return_value=(self.a,None)):
   res=self.client.post('/api/v1/questions',data={'title':'Question with no topics','topic_ids':[]},content_type='application/json')
  self.assertEqual(res.status_code,400)
 def test_named_question_and_answer(self):
  with patch('forum.views.identity',return_value=(self.a,None)):
   q=self.client.post('/api/v1/questions',data={'title':'How should I begin to pray?','topic_ids':[str(self.t.id)]},content_type='application/json')
   self.assertEqual(q.status_code,201)
   a=self.client.post('/api/v1/questions/'+q.json()['data']['id']+'/answers',data={'body':'Begin with a simple regular routine.'},content_type='application/json')
   self.assertEqual(a.status_code,201)
