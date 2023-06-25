cd engine
ls
coverage run --source='.' manage.py test
coverage lcov 
