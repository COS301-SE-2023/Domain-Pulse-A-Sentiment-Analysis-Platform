project1="../backend/engine"
project2="../backend/profilemanager"
project3="../backend/warehouse"

cd $project1
coverage run --source='.' manage.py test
coverage report -m

cd $project2
coverage run --source='.' manage.py test
coverage report -m

cd $project3
coverage run --source='.' manage.py test
coverage report -m

coverage combine
coverage report -m
coverage lcov -o coverage.lcov