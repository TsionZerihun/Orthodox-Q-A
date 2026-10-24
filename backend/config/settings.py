import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url
BASE_DIR=Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR/'.env')
SECRET_KEY=os.environ.get('DJANGO_SECRET_KEY','local-only-change-before-deployment')
DEBUG=os.environ.get('DJANGO_DEBUG','true').lower()=='true'
ALLOWED_HOSTS=os.environ.get('DJANGO_ALLOWED_HOSTS','localhost,127.0.0.1,testserver').split(',')
INSTALLED_APPS=['django.contrib.contenttypes','forum']
MIDDLEWARE=['forum.middleware.LocalCors','django.middleware.security.SecurityMiddleware','django.middleware.common.CommonMiddleware']
ROOT_URLCONF='config.urls'
DATABASES={'default':dj_database_url.parse(os.environ['DATABASE_URL'])} if os.environ.get('DATABASE_URL') else {'default':{'ENGINE':'django.db.backends.sqlite3','NAME':BASE_DIR/'dev.sqlite3'}}
USE_TZ=True
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
SUPABASE_URL=os.environ.get('SUPABASE_URL','').rstrip('/')
FRONTEND_ORIGIN=os.environ.get('FRONTEND_ORIGIN','http://localhost:3000')
if not DEBUG and (SECRET_KEY=='local-only-change-before-deployment' or not os.environ.get('DATABASE_URL')):raise RuntimeError('Production requires explicit secret and PostgreSQL DATABASE_URL')
