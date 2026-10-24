import json,uuid,urllib.request,urllib.error
from functools import wraps
from django.conf import settings
from django.db import transaction
from django.http import JsonResponse
from .models import Account,Topic,Question,Answer

def error(message,status=400,code='VALIDATION_ERROR'):
 return JsonResponse({'error':{'code':code,'message':message}},status=status)
def endpoint(methods):
 def deco(fn):
  @wraps(fn)
  def view(request,*args,**kwargs):
   if request.method not in methods:return error('Method not allowed.',405,'METHOD_NOT_ALLOWED')
   try:return fn(request,*args,**kwargs)
   except (ValueError,TypeError,json.JSONDecodeError):return error('Invalid request.')
  return view
 return deco

def identity(request):
 token=request.headers.get('Authorization','')
 if not token.startswith('Bearer '):return None,error('Please sign in.',401,'AUTH_REQUIRED')
 if not settings.SUPABASE_URL:return None,error('Supabase is not configured.',503,'AUTH_UNAVAILABLE')
 # Verify with Supabase Auth rather than accepting locally decoded claims.
 req=urllib.request.Request(settings.SUPABASE_URL+'/auth/v1/user',headers={'Authorization':token,'apikey':__import__('os').environ.get('SUPABASE_PUBLIC_KEY','')})
 try:
  with urllib.request.urlopen(req,timeout=8) as response:user=json.load(response)
 except urllib.error.HTTPError:return None,error('Session is invalid or expired.',401,'INVALID_SESSION')
 except (urllib.error.URLError,TimeoutError):return None,error('Authentication is temporarily unavailable.',503,'AUTH_UNAVAILABLE')
 if not user.get('email_confirmed_at'):return None,error('Verify your email before participating.',403,'EMAIL_VERIFICATION_REQUIRED')
 user_id=uuid.UUID(user['id'])
 name=str(user.get('user_metadata',{}).get('display_name','Member')).strip()[:50] or 'Member'
 account,_=Account.objects.get_or_create(supabase_user_id=user_id,defaults={'display_name':name})
 # These starter writes serialize on account during each mutation; full deletion/role design is not implemented.
 if account.status!='active':return None,error('This account cannot participate.',403,'ACCOUNT_RESTRICTED')
 return account,None

def author(a,anonymous=False,is_author=False):
 return {'label':('Anonymous author' if is_author else 'Anonymous') if anonymous else (a.display_name if a else 'Deleted member'),'is_question_author':is_author}
def qdata(q):
 return {'id':str(q.id),'title':q.title,'body':q.body,'is_anonymous':q.is_anonymous,'author':author(q.author,q.is_anonymous),'topics':[{'id':str(t.id),'name':t.name} for t in q.topics.all()],'answer_count':q.answers.filter(status='published').count(),'created_at':q.created_at.isoformat()}
def adata(a):
 return {'id':str(a.id),'body':a.body,'author':author(a.author,a.question.is_anonymous and a.is_question_author,a.is_question_author),'created_at':a.created_at.isoformat()}
def body(request):
 if len(request.body)>100000:raise ValueError('Too large')
 value=json.loads(request.body)
 if not isinstance(value,dict):raise ValueError('Invalid body')
 return value
@endpoint(['GET'])
def health(request):return JsonResponse({'data':{'status':'ok','scope':'foundation'}})
@endpoint(['GET'])
def topics(request):return JsonResponse({'items':[{'id':str(t.id),'name':t.name} for t in Topic.objects.filter(is_active=True)]})
@endpoint(['GET','POST'])
def questions(request):
 if request.method=='GET':
  qs=Question.objects.filter(status='published').select_related('author').prefetch_related('topics').order_by('-created_at','-id')
  if request.GET.get('q'):qs=qs.filter(title__icontains=request.GET['q'])
  if request.GET.get('topic'):qs=qs.filter(topics__id=uuid.UUID(request.GET['topic']))
  if request.GET.get('feed')=='unanswered':qs=qs.exclude(answers__status='published')
  return JsonResponse({'items':[qdata(q) for q in qs[:50]],'has_more':qs.count()>50,'next_cursor':None,'foundation_note':'First 50 only; ranking and cursor pagination not implemented.'})
 account,err=identity(request)
 if err is not None:return err
 d=body(request)
 if set(d)-{'title','body','is_anonymous','topic_ids'}:return error('Unsupported fields.')
 title=str(d.get('title','')).strip();text=str(d.get('body','')).strip();anon=d.get('is_anonymous',False)
 ids=d.get('topic_ids',[])
 if not isinstance(ids,list) or not 1<=len(ids)<=3 or len(set(ids))!=len(ids):return error('Choose 1–3 distinct topics.')
 if not 10<=len(title)<=200 or len(text)>10000 or type(anon) is not bool:return error('Check title, details, and identity.')
 with transaction.atomic():
  account=Account.objects.select_for_update().get(pk=account.pk)
  if account.status!='active':return error('Account restricted.',403,'ACCOUNT_RESTRICTED')
  selected=list(Topic.objects.filter(pk__in=[uuid.UUID(x) for x in ids],is_active=True))
  if len(selected)!=len(ids):return error('Choose existing active topics.')
  q=Question.objects.create(author=account,title=title,body=text,is_anonymous=anon);q.topics.set(selected)
 return JsonResponse({'data':qdata(q)},status=201)
@endpoint(['GET','POST'])
def answers(request,question_id):
 q=Question.objects.filter(pk=question_id,status='published').select_related('author').first()
 if not q:return error('Question unavailable.',404,'RESOURCE_NOT_FOUND')
 if request.method=='GET':return JsonResponse({'items':[adata(a) for a in q.answers.filter(status='published').select_related('author','question').order_by('created_at','id')[:100]]})
 account,err=identity(request)
 if err is not None:return err
 d=body(request)
 if set(d)-{'body'}:return error('Unsupported fields.')
 text=str(d.get('body','')).strip()
 if not 10<=len(text)<=20000:return error('Answer must contain 10–20,000 characters.')
 with transaction.atomic():
  account=Account.objects.select_for_update().get(pk=account.pk)
  q=Question.objects.select_for_update().get(pk=q.pk)
  if account.status!='active' or q.status!='published':return error('Posting is no longer available.',409,'INVALID_TRANSITION')
  a=Answer.objects.create(question=q,author=account,body=text,is_question_author=q.author_id==account.pk)
 return JsonResponse({'data':adata(a)},status=201)
