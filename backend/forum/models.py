import uuid
from django.db import models
class Account(models.Model):
 id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
 supabase_user_id=models.UUIDField(unique=True)
 display_name=models.CharField(max_length=50)
 status=models.CharField(max_length=20,default='active')
class Topic(models.Model):
 id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
 name=models.CharField(max_length=100)
 is_active=models.BooleanField(default=True)
class Question(models.Model):
 id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
 author=models.ForeignKey(Account,null=True,on_delete=models.SET_NULL)
 title=models.CharField(max_length=200)
 body=models.TextField(blank=True)
 is_anonymous=models.BooleanField(default=False)
 topics=models.ManyToManyField(Topic)
 status=models.CharField(max_length=12,default='published')
 created_at=models.DateTimeField(auto_now_add=True)
class Answer(models.Model):
 id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
 question=models.ForeignKey(Question,related_name='answers',on_delete=models.PROTECT)
 author=models.ForeignKey(Account,null=True,on_delete=models.SET_NULL)
 body=models.TextField()
 is_question_author=models.BooleanField(default=False)
 status=models.CharField(max_length=12,default='published')
 created_at=models.DateTimeField(auto_now_add=True)
