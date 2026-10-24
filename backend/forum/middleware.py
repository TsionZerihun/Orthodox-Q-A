from django.conf import settings
from django.http import HttpResponse
class LocalCors:
 def __init__(self,get_response): self.get_response=get_response
 def __call__(self,request):
  response=HttpResponse(status=204) if request.method=='OPTIONS' else self.get_response(request)
  if request.headers.get('Origin')==settings.FRONTEND_ORIGIN:
   response['Access-Control-Allow-Origin']=settings.FRONTEND_ORIGIN
   response['Vary']='Origin'
   response['Access-Control-Allow-Headers']='Authorization, Content-Type'
   response['Access-Control-Allow-Methods']='GET, POST, OPTIONS'
  response['Cache-Control']='no-store'
  return response
