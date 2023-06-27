project1="./engine"
project2="../profilemanager"
project3="../warehouse"

cd $project1
coverage run --source='.' manage.py test
coverage report -m
coverage xml -o coverage.xml

cd $project2
coverage run --source='.' manage.py test
coverage report -m
coverage xml -o coverage.xml

cd $project3
coverage run --source='.' manage.py test
coverage report -m
coverage xml -o coverage.xml
coverage combine
coverage report -m
coverage html -d coverage_html
coverage lcov -o coverage.lcov